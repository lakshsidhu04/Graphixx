const Legend = () => {
    const items = [
        { color: '#16a34a', label: 'Current' },           
        { color: '#facc15', label: 'In Queue / Path' },    
        { color: '#000000', label: 'Visited' },    
        { color: '#EF233C', label: 'Unvisited' },        
    ];

    return (
        <div
            style={{
                padding: '12px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                width: '180px',
                fontSize: '14px',
                border: '1px solid #e5e7eb',
            }}
        >
            <h4 style={{ fontWeight: 600, textAlign: 'center', color: '#374151', marginBottom: '8px' }}>
                Legend
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {items.map((item, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '8px' }}>
                        <div
                            style={{
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                backgroundColor: item.color,
                                border: '1px solid #ccc',
                            }}
                        />
                        <span style={{ color: '#4b5563' }}>{item.label}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Legend;
