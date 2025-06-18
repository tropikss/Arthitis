import { createContext, useContext, useState, useEffect } from "react";
import { API_URL } from './config.js';

const SubjectsContext = createContext();

export function SubjectsProvider({ children }) {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);

  async function fetchSubjects() {
    setLoading(true);
    const res = await fetch(`${API_URL}/subjects`);
    const data = await res.json();
    setSubjects(data);
    setLoading(false);
  }

  async function addSubject(data) {
    const res = await fetch(`${API_URL}/subjects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const newSubject = await res.json();
    setSubjects(subjects => [...subjects, newSubject]);
    return newSubject;
  }

  async function deleteSubject(id) {
    await fetch(`${API_URL}/subjects/${id}`, {
      method: 'DELETE'
    });
    setSubjects(subjects => subjects.filter(s => s.id !== id));
  }

  async function updateSubject(id, data) {
    const res = await fetch(`${API_URL}/subjects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const updated = await res.json();
    setSubjects(subjects => subjects.map(s => s.id === id ? updated : s));
    return updated;
  }

  useEffect(() => {
    fetchSubjects();
  }, []);

  return (
    <SubjectsContext.Provider value={{
      subjects,
      loading,
      fetchSubjects,
      addSubject,
      deleteSubject,
      updateSubject
    }}>
      {children}
    </SubjectsContext.Provider>
  );
}

export function useSubjects() {
  return useContext(SubjectsContext);
}
