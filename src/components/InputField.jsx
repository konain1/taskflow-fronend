


const InputField = ({ name, type, value,onChange }) => {
 
    
    
   
    return (

     
        <>
            <div>
                <span>{name} : </span>
                <input type={type} onChange={(e)=>onChange(e.target.value)} value={value}/>
            </div>
        </>
    )
    
}

export default InputField