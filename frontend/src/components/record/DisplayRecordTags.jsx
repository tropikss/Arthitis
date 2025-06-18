import InclinaisonTag from "./tags/InclinaisonTag"
import SpeedTag from "./tags/SpeedTag"
import WeightedTag from "./tags/WeightedTag";

export default function DisplayRecordTags({ onChange, isRecording, recordingTags}) {

    return (
        <>
            <InclinaisonTag isRecording={isRecording} onChange={onChange} />
            <SpeedTag isRecording={isRecording} onChange={onChange} />
            <WeightedTag isRecording={isRecording} onChange={onChange} /> 
            {/* <pre>{JSON.stringify(recordingTags, null, 2)}</pre> */}
        </>
    )
}