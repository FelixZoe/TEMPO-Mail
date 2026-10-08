import CryptoKit
import Foundation

enum OTAConfigurationError: LocalizedError {
    case missingPublicKey
    case invalidEnvelope
    case invalidSignature
    case unsupportedSchema
    case expired
    case httpStatus(Int)

    var errorDescription: String? {
        switch self {
        case .missingPublicKey: "OTA 配置缺少验证公钥"
        case .invalidEnvelope: "OTA 配置包格式无效"
        case .invalidSignature: "OTA 配置签名验证失败"
        case .unsupportedSchema: "OTA 配置版本不受支持"
        case .expired: "OTA 配置已过期"
        case .httpStatus(let status): "OTA 配置请求失败（HTTP \(status)）"
        }
    }
}

actor OTAConfigurationService {
    func fetch(url: URL, publicKeyBase64: String) async throws -> RemoteConfiguration {
        guard let keyData = Data(base64Encoded: publicKeyBase64) else {
            throw OTAConfigurationError.missingPublicKey
        }
        let (data, response) = try await URLSession.shared.data(from: url)
        guard let http = response as? HTTPURLResponse else { throw OTAConfigurationError.invalidEnvelope }
        guard (200..<300).contains(http.statusCode) else {
            throw OTAConfigurationError.httpStatus(http.statusCode)
        }

        let envelope = try JSONDecoder().decode(SignedConfigurationEnvelope.self, from: data)
        guard let payload = Data(base64Encoded: envelope.payload),
              let signatureData = Data(base64Encoded: envelope.signature) else {
            throw OTAConfigurationError.invalidEnvelope
        }
        let publicKey = try P256.Signing.PublicKey(x963Representation: keyData)
        let signature = try P256.Signing.ECDSASignature(derRepresentation: signatureData)
        guard publicKey.isValidSignature(signature, for: payload) else {
            throw OTAConfigurationError.invalidSignature
        }

        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        let configuration = try decoder.decode(RemoteConfiguration.self, from: payload)
        guard configuration.schemaVersion == 1 else { throw OTAConfigurationError.unsupportedSchema }
        guard !configuration.isExpired else { throw OTAConfigurationError.expired }
        return configuration
    }
}
