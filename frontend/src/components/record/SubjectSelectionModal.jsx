
import { useSubjects } from '../../api/subjects';
import React, { useEffect, useState } from 'react';
import FormWindow from '../explorer/FormWindow';
import RecordListSubject from './RecordListSubject';

export default function SubjectSelectionModal({ onSelect, onClose }) {
    const { subjects } = useSubjects();
  return (
  <FormWindow onClose={onClose} size={2}>
        <RecordListSubject
            onSelect={onSelect}
            onClose={onClose}
        />
    </FormWindow>
  );
}