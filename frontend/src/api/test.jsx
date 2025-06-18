import { createContext, useContext, useState, useEffect } from "react";
import { API_URL } from './config.js';

const TestsContext = createContext();

export function TestsProvider({ children }) {
  const [tests, setTests] = useState([]);
  const [selectedSubjectTests, setSelectedSubjectTests] = useState([]);
  const [loading, setLoading] = useState(false);

  async function fetchTestsBySubject(subject_id) {
    setLoading(true);
    const res = await fetch(`${API_URL}/tests/by-subject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject_id })
    });
    if (!res.ok) {
      setLoading(false);
      setSelectedSubjectTests([]);
    }
    const data = await res.json();
    setLoading(false);
    setSelectedSubjectTests(data);
  }

  async function fetchTests() {
    setLoading(true);
    const res = await fetch(`${API_URL}/tests`);
    const data = await res.json();
    setTests(data);
    setLoading(false);
  }

  async function addTest(data) {
    try {
      const res = await fetch(`${API_URL}/tests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to add test');
      const newTest = await res.json();
      setTests(tests => [...tests, newTest]);
      return newTest;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async function deleteTest(id) {
    await fetch(`${API_URL}/tests/${id}`, {
      method: 'DELETE'
    });
    setTests(tests => tests.filter(t => t.id !== id));
  }

  async function updateTest(id, data) {
    const res = await fetch(`${API_URL}/tests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const updated = await res.json();
    setTests(tests => tests.map(t => t.id === id ? updated : t));
    return updated;
  }

  useEffect(() => {
    fetchTests();
  }, []);

  return (
    <TestsContext.Provider value={{
      tests,
      loading,
      fetchTests,
      addTest,
      deleteTest,
      updateTest,
      fetchTestsBySubject,
      selectedSubjectTests
    }}>
      {children}
    </TestsContext.Provider>
  );
}

export function useTests() {
  return useContext(TestsContext);
}
