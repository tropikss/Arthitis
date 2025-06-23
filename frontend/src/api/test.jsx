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

  async function deleteTestByRecordId(id) {
    const res = await fetch(`${API_URL}/tests/id-by-record/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      console.error('Failed to delete test by record id');
      return null;
    } else {
      console.log(id, ' deleted');
    }
    const deleted = await res.json(); // deleted should contain the deleted test, including its id
    setTests(tests => tests.filter(t => t.id !== deleted.id));
    return deleted;
  }

  async function compareRecordIds(recordIds) {
    await fetchTests(); // Ensure tests are fetched before comparison
    
    const dbRecordIds = tests.map(test => test.record_id);

    // Not in DB: present in recordIds but not in dbRecordIds
    const notInDb = recordIds.filter(id => !dbRecordIds.includes(id));

    // Not on SD: present in dbRecordIds but not in recordIds
    const notOnSd = dbRecordIds.filter(id => !recordIds.includes(id));

    return { notInDb, notOnSd };
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
      selectedSubjectTests,
      compareRecordIds,
      deleteTestByRecordId
    }}>
      {children}
    </TestsContext.Provider>
  );
}

export function useTests() {
  return useContext(TestsContext);
}
