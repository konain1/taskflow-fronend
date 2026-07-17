const InputField = ({ name, type, value, onChange }) => {
    return (
        <div className="input-group">
            <span className="input-label">{name}</span>
            <input 
                className="input-field" 
                type={type} 
                onChange={(e) => onChange(e.target.value)} 
                value={value}
                placeholder={`Enter ${name}`}
            />
        </div>
    );
};

export default InputField;