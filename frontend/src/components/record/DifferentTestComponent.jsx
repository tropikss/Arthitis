
export default function DifferentTestComponent({differentTest}) {
  return (
    <div className="text-center text-gray-500">
      {differentTest !== null ? (
            <>{`${differentTest} different tests`}</>
      ) : (
            <>No different tests available</>
      )}
      </div>
  );
}