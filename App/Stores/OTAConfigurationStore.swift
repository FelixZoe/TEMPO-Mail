import Foundation
import Observation

@MainActor
@Observable
final class OTAConfigurationStore {
    private(set) var configuration = RemoteConfiguration.fallback
    private(set) var lastUpdated: Date?
    private(set) var errorMessage: String?

    private let service = OTAConfigurationService()
    private let defaults: UserDefaults

    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
    }

    func loadCached(for account: MailAccount) {
        guard let data = defaults.data(forKey: cacheKey(account.id)),
              let cached = try? decoder.decode(RemoteConfiguration.self, from: data),
              !cached.isExpired else {
            configuration = .fallback
            return
        }
        configuration = cached
    }

    func refresh(for account: MailAccount) async {
        loadCached(for: account)
        guard let url = account.remoteConfigURL else { return }
        guard let key = account.remoteConfigPublicKey, !key.isEmpty else {
            errorMessage = OTAConfigurationError.missingPublicKey.localizedDescription
            return
        }
        do {
            let fresh = try await service.fetch(url: url, publicKeyBase64: key)
            configuration = fresh
            defaults.set(try encoder.encode(fresh), forKey: cacheKey(account.id))
            lastUpdated = .now
            errorMessage = nil
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func removeCache(for account: MailAccount) {
        defaults.removeObject(forKey: cacheKey(account.id))
        configuration = .fallback
    }

    private func cacheKey(_ accountID: UUID) -> String { "tempo.ota.\(accountID.uuidString).v1" }

    private var encoder: JSONEncoder {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        return encoder
    }

    private var decoder: JSONDecoder {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return decoder
    }
}
