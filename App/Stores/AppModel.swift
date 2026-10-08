import Foundation
import Observation

@MainActor
@Observable
final class AppModel {
    let accounts: AccountStore
    let mail: MailStore
    let ota: OTAConfigurationStore
    var isPresentingAccountSetup = false
    var refreshGeneration = 0

    init(
        accounts: AccountStore = AccountStore(),
        mail: MailStore = MailStore(),
        ota: OTAConfigurationStore = OTAConfigurationStore()
    ) {
        self.accounts = accounts
        self.mail = mail
        self.ota = ota
    }

    func select(_ account: MailAccount) {
        accounts.select(account)
        mail.clear()
        ota.loadCached(for: account)
        Task { await ota.refresh(for: account) }
    }

    func requestMailRefresh() {
        refreshGeneration &+= 1
    }

    func password(for account: MailAccount) throws -> String {
        try accounts.password(for: account)
    }
}
