function DeleteTestConfirmation({ subject, onCancel, onConfirm }) {
    return (
        <div className="fixed inset-0 z-50 flex justify-center items-center backdrop-blur-sm bg-black/10">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Confirmation</h2>
                <p className="mb-4 text-gray-700">Are you sure you want to delete this test?</p>
                <div className="flex justify-end space-x-2">
                    <button onClick={onCancel} className="px-4 py-2 bg-gray-500 rounded hover:bg-gray-700">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
                </div>
            </div>
        </div>
    );
}

export default DeleteTestConfirmation;
