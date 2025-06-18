import SubjectForm from './SubjectForm'
import FormWindow from './FormWindow'
import { useState } from 'react'

function NewSubjectButton({}) {
    const [showForm, setShowForm] = useState(false)

    const handleClick = () => {
        console.log(`Creating new subject`);
        setShowForm(true);
    }

    return (
        <>
        <button
            onClick={handleClick}
            className="bg-black py-2 px-4 bg-transparent text-color1 font-semibold border border-color1 rounded hover:bg-color1 hover:text-color5 hover:border-transparent transition ease-in duration-200 transform hover:-translate-y-1 active:translate-y-0"
        >New</button>

        {showForm && (
        <FormWindow onClose={() => setShowForm(false)}>
          <SubjectForm onClose={() => setShowForm(false)}/>
        </FormWindow>
      )}
      </>
    );
}

export default NewSubjectButton;