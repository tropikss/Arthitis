import OptionSelector from "./OptionSelector"

export default function WeightedTag({isRecording, onChange}) {
    return (
        <OptionSelector
            label="Lesté"
            options={[
                { label: 'Oui', value: true },
                { label: 'Non', value: false }
            ]}
            onSelect={(val) => onChange(prev => ({ ...prev, weighted: val }))}
            disabled={isRecording}
        />
    );
}