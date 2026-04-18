// ═══════════════════════════════════════════════════════════════
// FILE: hooks/useWorkflow.js
// React hook — use in any component that submits things for approval
// ═══════════════════════════════════════════════════════════════
import { useState, useCallback } from "react";

export function useWorkflow() {
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [result,   setResult]   = useState(null);

  // Submit any entity for approval
  const submit = useCallback(async (action) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/workflow/submit", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(action),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setResult(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Approve or reject a request
  const decide = useCallback(async (requestId, decision, comment) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/workflow/decide", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ requestId, decision, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Decision failed");
      setResult(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cancel a request
  const cancel = useCallback(async (requestId, reason) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/workflow/cancel", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ requestId, reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Cancel failed");
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { submit, decide, cancel, loading, error, result };
}
