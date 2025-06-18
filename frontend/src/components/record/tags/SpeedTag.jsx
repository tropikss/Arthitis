import OptionSelector from "./OptionSelector"

export default function InclinaisonTag({isRecording, onChange}) {
    return (
        <OptionSelector
            label="Vitesse (km/h)"
            options={[
                { label: '5', value: 5 },
                { label: '10', value: 10 },
                { label: '15', value: 15 },
            ]}
            onSelect={(val) => onChange(prev => ({ ...prev, speed: val }))}
            disabled={isRecording}
        />
    );
}