import OptionSelector from "./OptionSelector"

export default function InclinaisonTag({isRecording, onChange}) {
    return (
        <OptionSelector
            label="Inclinaison (%)"
            options={[
                { label: '10', value: 10 },
                { label: '0', value: 0 },
                { label: '-10', value: -10 },
            ]}
            onSelect={(val) => onChange(prev => ({ ...prev, inclinaison: val }))}
            disabled={isRecording}
        />
    );
}