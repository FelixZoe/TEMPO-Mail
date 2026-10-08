import Foundation
import Observation

@MainActor
@Observable
final class AdministrationStore {
    private(set) var accessByAccountID: [UUID: AdministrationAccess] = [:]
    private(set) var accounts: [ManagedAccount] = []
    private(set) var domains: [ManagedDomain] = []
    private(set) var temporaryAddresses: [TemporaryAddress] = []
    private(set) var isLoading = false
    var errorMessage: String?

    private let defaults: UserDefaults
    private let cacheKey = "tempo.administration-access.v1"

    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        loadAccessCache()
    }

    func access(for account: MailAccount?) -> AdministrationAccess? {
        guard let account else { return nil }
        return accessByAccountID[account.id]
    }

    func isAdministrator(for account: MailAccount?) -> Bool {
        access(for: account)?.isAdministrator == true
    }

    func activate(account: MailAccount, password: String) async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        let client = AdministrationClient(account: account, password: password)
        do {
            let access = try await client.fetchAccess()
            accessByAccountID[account.id] = access
            persistAccessCache()
            guard access.isAdministrator else {
                clearVisibleData()
                return
            }
            try await refresh(using: client, access: access)
        } catch AdministrationError.forbidden {
            accessByAccountID.removeValue(forKey: account.id)
            persistAccessCache()
            clearVisibleData()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func refresh(account: MailAccount, password: String) async {
        guard let access = access(for: account), access.isAdministrator else { return }
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        do {
            try await refresh(using: AdministrationClient(account: account, password: password), access: access)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func createAccount(_ draft: ManagedAccountDraft, account: MailAccount, password: String) async -> Bool {
        await perform(account: account, password: password) { client in
            try await client.createAccount(draft)
        }
    }

    func setSuspended(_ suspended: Bool, managedAccount: ManagedAccount, account: MailAccount, password: String) async {
        _ = await perform(account: account, password: password) { client in
            try await client.setSuspended(suspended, account: managedAccount)
        }
    }

    func deleteAccount(_ managedAccount: ManagedAccount, account: MailAccount, password: String) async {
        _ = await perform(account: account, password: password) { client in
            try await client.deleteAccount(id: managedAccount.id)
        }
    }

    func createTemporaryAddress(_ draft: TemporaryAddressDraft, account: MailAccount, password: String) async -> Bool {
        await perform(account: account, password: password) { client in
            try await client.createTemporaryAddress(draft)
        }
    }

    func setTemporaryAddress(_ address: TemporaryAddress, enabled: Bool, account: MailAccount, password: String) async {
        _ = await perform(account: account, password: password) { client in
            try await client.setTemporaryAddress(address, enabled: enabled)
        }
    }

    func deleteTemporaryAddress(_ address: TemporaryAddress, account: MailAccount, password: String) async {
        _ = await perform(account: account, password: password) { client in
            try await client.deleteTemporaryAddress(id: address.id)
        }
    }

    func removeAccess(for account: MailAccount) {
        accessByAccountID.removeValue(forKey: account.id)
        persistAccessCache()
        clearVisibleData()
    }

    func clearVisibleData() {
        accounts = []
        domains = []
        temporaryAddresses = []
    }

    private func refresh(using client: AdministrationClient, access: AdministrationAccess) async throws {
        async let accountList = client.fetchAccounts()
        async let domainList = client.fetchDomains()
        let loadedAccounts = try await accountList
        let loadedDomains = try await domainList
        let loadedTemporaryAddresses: [TemporaryAddress]
        if access.supportsTemporaryMail {
            loadedTemporaryAddresses = try await client.fetchTemporaryAddresses()
        } else {
            loadedTemporaryAddresses = []
        }
        accounts = loadedAccounts
        domains = loadedDomains
        temporaryAddresses = loadedTemporaryAddresses
    }

    private func perform(
        account: MailAccount,
        password: String,
        operation: (AdministrationClient) async throws -> Void
    ) async -> Bool {
        guard let access = access(for: account), access.isAdministrator else { return false }
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        let client = AdministrationClient(account: account, password: password)
        do {
            try await operation(client)
            try await refresh(using: client, access: access)
            return true
        } catch {
            errorMessage = error.localizedDescription
            return false
        }
    }

    private func loadAccessCache() {
        guard let data = defaults.data(forKey: cacheKey),
              let decoded = try? JSONDecoder().decode([String: AdministrationAccess].self, from: data) else { return }
        accessByAccountID = Dictionary(uniqueKeysWithValues: decoded.compactMap { key, value in
            UUID(uuidString: key).map { ($0, value) }
        })
    }

    private func persistAccessCache() {
        let encoded = Dictionary(uniqueKeysWithValues: accessByAccountID.map { ($0.key.uuidString, $0.value) })
        guard let data = try? JSONEncoder().encode(encoded) else { return }
        defaults.set(data, forKey: cacheKey)
    }
}
