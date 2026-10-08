import XCTest
@testable import TEMPOMail

final class ServerPolicyTests: XCTestCase {
    func testAcceptsHTTPS() throws {
        let url = try XCTUnwrap(ServerPolicy.validatedURL("https://mail.example.com/.well-known/jmap"))
        XCTAssertEqual(url.host, "mail.example.com")
    }

    func testRejectsRemoteHTTP() {
        XCTAssertThrowsError(try ServerPolicy.validatedURL("http://mail.example.com/jmap"))
    }

    func testAllowsLocalhostHTTPForDevelopment() throws {
        let url = try XCTUnwrap(ServerPolicy.validatedURL("http://localhost:8080/jmap"))
        XCTAssertEqual(url.port, 8080)
    }

    func testBuildsJMAPDiscoveryURLFromServerRoot() throws {
        let url = try ServerPolicy.sessionURL(from: "https://mail.example.com")
        XCTAssertEqual(url.absoluteString, "https://mail.example.com/.well-known/jmap")
    }

    func testPreservesExplicitJMAPSessionPath() throws {
        let url = try ServerPolicy.sessionURL(from: "https://mail.example.com/custom/session")
        XCTAssertEqual(url.path, "/custom/session")
    }

    func testEmailValidation() {
        XCTAssertNoThrow(try ServerPolicy.validateEmail("person@example.com"))
        XCTAssertThrowsError(try ServerPolicy.validateEmail("not-an-email"))
    }
}
