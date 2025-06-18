import React, { useState } from "react";
import NewSubjectButton from "./NewSubjectButton";
import { useSubjects } from "../../api/subjects";

function EditSubjectForm( {subject, onClose}) {
    const { updateSubject, fetchSubjects } = useSubjects();
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        name: subject.name || "sdfsdf",
        age: subject.age || "",
        weight: subject.weight || "",
        height: subject.height || "",
        sport: subject.sport || "",
    });

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        let newValue = value;
        if (["age", "weight", "height", "sport"].includes(name)) {
            newValue = value === "" ? "" : Number(value);
        }
        setForm({ ...form, [name]: newValue });
    };

    const [status, setStatus] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        updateSubject(subject.id, form)
            .then(() => {
                console.log("Subject updated successfully:", form);
                fetchSubjects();
                setStatus("success");
            })
            .catch((err) => {
                console.error("Error updating subject:", err);
                setStatus("error");
            }
        );
        onClose();
    };

    return (
        <form className="max-w-md mx-auto" onSubmit={handleSubmit}>
            <div className="relative z-0 w-full mb-5 group">
                <input
                    type="text"
                    name="name"
                    id="name"
                    value={form.name}
                    onChange={handleChange}
                    className={`peer block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 focus:outline-none focus:ring-0 focus:border-blue-600`}
                    required
                />
                <label
                    htmlFor="name"
                    className={`absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] transition-all peer-focus:scale-75 peer-focus:-translate-y-6 ${
                        form.name ? "-translate-y-6 scale-75" : "translate-y-0 scale-100"
                    }`}
                >
                    Name
                </label>
            </div>

            <div className="relative z-0 w-full mb-5 group">
                <input
                    type="number"
                    name="age"
                    id="age"
                    value={form.age}
                    onChange={handleChange}
                    className="no-spinner block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    placeholder={subject.age || " "}
                    required
                />
                <label
                    htmlFor="age"
                    className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                >
                    Age
                </label>
            </div>
            <div className="grid md:grid-cols-2 md:gap-6">
                <div className="relative z-0 w-full mb-5 group">
                    <input
                        type="number"
                        name="weight"
                        id="weight"
                        value={form.weight}
                        onChange={handleChange}
                        className="no-spinner block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                        placeholder={subject.weight || " "}
                        required
                    />
                    <label
                        htmlFor="weight"
                        className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                    >
                        Weight
                    </label>
                    <span className="absolute right-0 top-2.5 text-sm text-gray-500 dark:text-gray-400">
                        kg
                    </span>
                </div>
                <div className="relative z-0 w-full mb-5 group">
                    <input
                        type="number"
                        name="height"
                        id="height"
                        value={form.height}
                        onChange={handleChange}
                        className="no-spinner block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                        placeholder={subject.height || " "}
                        required
                    />
                    <label
                        htmlFor="height"
                        className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                    >
                        Height
                    </label>
                    <span className="absolute right-0 top-2.5 text-sm text-gray-500 dark:text-gray-400">
                        cm
                    </span>
                </div>
            </div>
            <div className="relative z-0 w-full mb-5 group">
                <input
                    type="number"
                    name="sport"
                    id="sport"
                    value={form.sport}
                    onChange={handleChange}
                    className="no-spinner block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    placeholder={subject.sport || " "}
                    required
                />
                <label
                    htmlFor="sport"
                    className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                >
                    Sport condition (0-5)
                </label>
            </div>
            <button
                type="submit"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
                Submit
            </button>
            <style>
                {`
                .no-spinner::-webkit-outer-spin-button,
                .no-spinner::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                .no-spinner[type=number] {
                    -moz-appearance: textfield;
                }
            `}
            </style>
        </form>
    );
}

export default EditSubjectForm;