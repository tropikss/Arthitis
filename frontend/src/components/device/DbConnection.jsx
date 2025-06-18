
import DBConnectedBadge from "./DBConnectedBadge";
function DbConnection({  }) {

return (
    <div className="flex justify-center items-center h-full w-full">
        <div className='rounded-xl bg-color2 p-2'>
            <div className="h-1/4 flex justify-center items-center">DB</div>
            <div className="h-3/4 flex justify-center items-center">
                <DBConnectedBadge />
            </div>
        </div>
    </div>
);
}

export default DbConnection;