import SwiftUI

struct RootView: View {
    @Environment(AppModel.self) private var model

    var body: some View {
        Group {
            if model.accounts.accounts.isEmpty {
                SetupView(allowsCancellation: false)
            } else {
                MailHomeView()
            }
        }
        .sheet(isPresented: Binding(
            get: { model.isPresentingAccountSetup },
            set: { model.isPresentingAccountSetup = $0 }
        )) {
            SetupView(allowsCancellation: true)
        }
    }
}
