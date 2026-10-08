import Foundation

enum ServerPolicyError: LocalizedError {
    case invalidURL
    case insecureTransport
    case invalidEmail

    var errorDescription: String? {
        switch self {
        case .invalidURL: "服务地址无效"
        case .insecureTransport: "邮件服务必须使用 HTTPS"
        case .invalidEmail: "邮箱地址格式无效"
        }
    }
}

enum ServerPolicy {
    static func validatedURL(_ rawValue: String, required: Bool = true) throws -> URL? {
        let value = rawValue.trimmingCharacters(in: .whitespacesAndNewlines)
        if value.isEmpty && !required { return nil }
        guard let url = URL(string: value), let host = url.host, !host.isEmpty else {
            throw ServerPolicyError.invalidURL
        }
        let isLocal = host == "localhost" || host == "127.0.0.1" || host == "::1"
        guard url.scheme?.lowercased() == "https" || (isLocal && url.scheme?.lowercased() == "http") else {
            throw ServerPolicyError.insecureTransport
        }
        return url
    }

    static func sessionURL(from rawValue: String) throws -> URL {
        guard let url = try validatedURL(rawValue) else { throw ServerPolicyError.invalidURL }
        var components = URLComponents(url: url, resolvingAgainstBaseURL: false)
        let path = components?.path ?? ""
        if path.isEmpty || path == "/" {
            components?.path = "/.well-known/jmap"
        }
        guard let result = components?.url else { throw ServerPolicyError.invalidURL }
        return result
    }

    static func validateEmail(_ value: String) throws {
        let parts = value.split(separator: "@", omittingEmptySubsequences: false)
        guard parts.count == 2, !parts[0].isEmpty, parts[1].contains(".") else {
            throw ServerPolicyError.invalidEmail
        }
    }
}
