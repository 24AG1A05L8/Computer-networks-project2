package org.sahaayanet.app.mesh.crypto

import java.nio.charset.StandardCharsets
import java.security.MessageDigest
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

/**
 * SahaayaNet Android Cryptographic Bundle Integrity Engine
 * Computes deterministic SHA-256 HMAC digests over packet metadata and emergency payloads
 * to prevent tamper, spoofing, or packet modification in multi-hop store-carry-forward routing.
 */
object BundleCrypto {
    private const val HMAC_ALGORITHM = "HmacSHA256"
    const val DEFAULT_NETWORK_KEY = "sahaayanet-emergency-mesh-root-key-2026"

    /**
     * Computes a canonical SHA-256 HMAC for an outgoing packet.
     */
    fun computeChecksum(
        bundleId: String,
        originNodeId: String,
        destinationNodeId: String,
        payloadType: String,
        createdTimestamp: Long,
        payloadJson: String,
        secretKey: String = DEFAULT_NETWORK_KEY
    ): String {
        // Canonical digest string
        val canonicalString = "bId:$bundleId|orig:$originNodeId|dest:$destinationNodeId|type:$payloadType|time:$createdTimestamp|payload:$payloadJson"

        return try {
            val keySpec = SecretKeySpec(secretKey.toByteArray(StandardCharsets.UTF_8), HMAC_ALGORITHM)
            val mac = Mac.getInstance(HMAC_ALGORITHM)
            mac.init(keySpec)
            val rawHmac = mac.doFinal(canonicalString.toByteArray(StandardCharsets.UTF_8))
            bytesToHex(rawHmac)
        } catch (e: Exception) {
            // Fallback to standard SHA-256 hash if Mac fails
            val digest = MessageDigest.getInstance("SHA-256")
            val hash = digest.digest(canonicalString.toByteArray(StandardCharsets.UTF_8))
            bytesToHex(hash)
        }
    }

    /**
     * Verifies whether the incoming checksum matches the packet content.
     */
    fun verifyChecksum(
        bundleId: String,
        originNodeId: String,
        destinationNodeId: String,
        payloadType: String,
        createdTimestamp: Long,
        payloadJson: String,
        receivedChecksum: String,
        secretKey: String = DEFAULT_NETWORK_KEY
    ): Boolean {
        if (receivedChecksum.isBlank()) return false
        val computed = computeChecksum(
            bundleId, originNodeId, destinationNodeId, payloadType,
            createdTimestamp, payloadJson, secretKey
        )
        return computed.equals(receivedChecksum, ignoreCase = true)
    }

    private fun bytesToHex(bytes: ByteArray): String {
        val hexChars = CharArray(bytes.size * 2)
        val hexArray = "0123456789abcdef".toCharArray()
        for (i in bytes.indices) {
            val v = bytes[i].toInt() and 0xFF
            hexChars[i * 2] = hexArray[v ushr 4]
            hexChars[i * 2 + 1] = hexArray[v and 0x0F]
        }
        return String(hexChars)
    }
}
