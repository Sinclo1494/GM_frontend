import { describe, it, expect } from "vitest";
import { useContext } from "react";
import { AuthContext, type AuthContextType } from "../../context/AuthContext";
import { render, screen } from "@testing-library/react";

// A tiny consumer that surfaces the raw context value into the DOM for assertions.
function ContextProbe() {
  const value = useContext(AuthContext);
  return (
    <div>
      <span data-testid="context-value">
        {value === null ? "NULL" : "PROVIDED"}
      </span>
      <span data-testid="has-login">{String(!!(value && "login" in value))}</span>
      <span data-testid="has-logout">{String(!!(value && "logout" in value))}</span>
      <span data-testid="has-setuser">{String(!!(value && "setUser" in value))}</span>
      <span data-testid="has-token">{String(!!(value && "token" in value))}</span>
      <span data-testid="has-user">{String(!!(value && "user" in value))}</span>
    </div>
  );
}

describe("AuthContext.ts", () => {
  it("creates a context whose default (no provider) value is null", () => {
    render(<ContextProbe />);
    expect(screen.getByTestId("context-value").textContent).toBe("NULL");
  });

  it("exposes the full AuthContextType shape when a provider value is supplied", () => {
    const fakeValue: AuthContextType = {
      token: "abc",
      user: null,
      login: () => {},
      logout: () => {},
      setUser: () => {},
    };
    render(
      <AuthContext.Provider value={fakeValue}>
        <ContextProbe />
      </AuthContext.Provider>,
    );
    expect(screen.getByTestId("context-value").textContent).toBe("PROVIDED");
    expect(screen.getByTestId("has-login").textContent).toBe("true");
    expect(screen.getByTestId("has-logout").textContent).toBe("true");
    expect(screen.getByTestId("has-setuser").textContent).toBe("true");
    expect(screen.getByTestId("has-token").textContent).toBe("true");
    expect(screen.getByTestId("has-user").textContent).toBe("true");
  });

  it("allows overriding the context value via the provider", () => {
    render(
      <AuthContext.Provider value={{ token: "t1", user: null, login: () => {}, logout: () => {}, setUser: () => {} }}>
        <AuthContext.Provider value={{ token: "t2", user: null, login: () => {}, logout: () => {}, setUser: () => {} }}>
          <ContextProbe />
        </AuthContext.Provider>
      </AuthContext.Provider>,
    );
    // The innermost provider wins.
    expect(screen.getByTestId("context-value").textContent).toBe("PROVIDED");
  });
});
