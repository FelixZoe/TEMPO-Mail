import Foundation
import Observation

@MainActor
@Observable
final class AccountStore {
    private(set) var accounts: [MailAccount] = []
    var selectedAccountID: UUID? {
        didSet { persistSelection() }
    }

    private let defaults: UserDefaults
    private let keychain: KeychainStore
    private let accountsKey = "tempo.accounts.v1"
    private let selectionKey = "tempo.selected-account.v1"

    init(defaults: UserDefaults = .standard, keychain: KeychainStore = KeychainStore()) {
        self.defaults = defaults
        self.keychain = keychain
        load()
    }

    var selectedAccount: MailAccount? {
        guard let selectedAccountID else { return accounts.first }
        return accounts.first(where: { $0.id == selectedAccountID }) ?? accounts.first
    }

    func add(_ account: MailAccount, password: String) throws {
        try keychain.save(password: password, for: account.id)
        accounts.append(account)
        accounts.sort { $0.createdAt < $1.createdAt }
        selectedAccountID = account.id
        persistAccounts()
    }

    func select(_ account: MailAccount) {
        selectedAccountID = account.id
    }

    func password(for account: MailAccount) throws -> String {
        try keychain.password(for: account.id)
    }

    func remove(_ account: MailAccount) throws {
        try keychain.deletePassword(for: account.id)
        accounts.removeAll { $0.id == account.id }
        if selectedAccountID == account.id { selectedAccountID = accounts.first?.id }
        persistAccounts()
    }

    private func load() {
        if let data = defaults.data(forKey: accountsKey),
           let decoded = try? JSONDecoder().decode([MailAccount].self, from: data) {
            accounts = decoded
        }
        if let rawSelection = defaults.string(forKey: selectionKey) {
            selectedAccountID = UUID(uuidString: rawSelection)
        }
        if selectedAccountID == nil || !accounts.contains(where: { $0.id == selectedAccountID }) {
            selectedAccountID = accounts.first?.id
        }
    }

    private func persistAccounts() {
        guard let data = try? JSONEncoder().encode(accounts) else { return }
        defaults.set(data, forKey: accountsKey)
    }

    private func persistSelection() {
        defaults.set(selectedAccountID?.uuidString, forKey: selectionKey)
    }
}
