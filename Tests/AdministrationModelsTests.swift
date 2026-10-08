import XCTest
@testable import TEMPOMail

final class AdministrationModelsTests: XCTestCase {
    func testAdministratorRequiresAccountReadPermissions() throws {
        let access = try decodeAccess(["sys-account-get", "sysAccountQuery", "sysAccountCreate"])
        XCTAssertTrue(access.isAdministrator)
        XCTAssertTrue(access.canCreateAccounts)
        XCTAssertFalse(access.canDeleteAccounts)
    }

    func testNonAdministratorDoesNotReceiveManagementMode() throws {
        let access = try decodeAccess(["authenticate", "emailSend"])
        XCTAssertFalse(access.isAdministrator)
    }

    func testSuspensionPreservesExistingPermissionOverrides() throws {
        let account = try XCTUnwrap(ManagedAccount(json: .object([
            "id": .string("1"),
            "name": .string("alice"),
            "emailAddress": .string("alice@example.com"),
            "permissions": .object([
                "@type": .string("Merge"),
                "enabledPermissions": .object(["emailSend": .bool(true)]),
                "disabledPermissions": .object(["spamFilterTrain": .bool(true)])
            ])
        ])))

        let suspended = account.permissionsSetting(authenticationDisabled: true).objectValue
        XCTAssertEqual(suspended?["enabledPermissions"]?.objectValue?["emailSend"]?.boolValue, true)
        XCTAssertEqual(suspended?["disabledPermissions"]?.objectValue?["spamFilterTrain"]?.boolValue, true)
        XCTAssertEqual(suspended?["disabledPermissions"]?.objectValue?["authenticate"]?.boolValue, true)
    }

    func testUnbanReturnsSimpleMergeToInheritedPermissions() throws {
        let account = try XCTUnwrap(ManagedAccount(json: .object([
            "id": .string("1"),
            "name": .string("alice"),
            "permissions": .object([
                "@type": .string("Merge"),
                "enabledPermissions": .object([:]),
                "disabledPermissions": .object(["authenticate": .bool(true)])
            ])
        ])))

        XCTAssertEqual(
            account.permissionsSetting(authenticationDisabled: false),
            .object(["@type": .string("Inherit")])
        )
    }

    func testMaskedEmailPermissionsEnableTemporaryMailboxManagement() throws {
        let access = try decodeAccess(["sysMaskedEmailGet", "sys-masked-email-query", "sysMaskedEmailCreate"])
        XCTAssertTrue(access.supportsTemporaryMail)
        XCTAssertTrue(access.canCreateTemporaryMail)
    }

    private func decodeAccess(_ permissions: [String]) throws -> AdministrationAccess {
        let data = try JSONSerialization.data(withJSONObject: ["permissions": permissions])
        return try JSONDecoder().decode(AdministrationAccess.self, from: data)
    }
}
