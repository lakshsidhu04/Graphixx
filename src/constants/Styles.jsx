export const zoomBtnStyle = {
    padding: '8px 12px',
    backgroundColor: '#0f4c5c',
    color: '#EDF2F4',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '20px',
    minWidth: '40px',
    cursor: 'pointer',
    transition: 'all 0.3s ease-in-out',
};

export const buttonStyle = {
    marginRight: '10px',
    padding: '8px 16px',
    backgroundColor: '#000',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '20px',
    cursor: 'pointer',
    transition: 'all 0.3s ease-in-out',
};

export const formStyle = {
    width: '60%',
    margin: '0 auto 20px',
    padding: '12px',
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    borderRadius: '6px',
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    justifyContent: 'center',
};

export const inputStyle = {
    padding: '6px',
    width: '150px',
};

export const submitBtnStyle = {
    padding: '8px 16px',
    backgroundColor: '#EF233C',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    cursor: 'pointer',
    transition: 'all 0.3s ease-in-out',
};

export const cancelBtnStyle = {
    padding: '8px 12px',
    backgroundColor: '#ccc',
    color: '#333',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    cursor: 'pointer',
    transition: 'all 0.3s ease-in-out',
};

export const graphContainerStyle = {
    width: '60%',
    height: '600px',
    backgroundColor: '#E5E5E5',
    margin: '0 auto 40px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    position: 'relative',
};


export const zoomControlStyle = {
    position: 'absolute',
    bottom: '20px',
    right: '20px',
    display: 'flex',
    gap: '10px',
    cursor: 'pointer',
    transition: 'all 0.3s ease-in-out',
};


export const nodeStyle = {
    selector: 'node',
    style: {
        label: 'data(label)',
        'text-valign': 'center',
        'text-halign': 'center',
        'background-color': '#EF233C',
        color: '#fff',
        'text-outline-width': 2,
        'text-outline-color': '#2B2D42',
        width: 50,
        height: 50,
        borderColor: '#fff',
        borderWidth: 2,
    },
};

export const directedEdgeStyle = {
    selector: 'edge',
    style: {
        label: 'data(label)',
        'curve-style': 'bezier',
        'target-arrow-shape': 'triangle',
        'target-arrow-color': '#0f4c5c',
        'line-color': '#0f4c5c',
        width: 2,
        'font-size': 10,
        'text-rotation': 'autorotate',
        'text-background-color': '#fff',
        'text-background-opacity': 1,
        'text-background-shape': 'roundrectangle',
        'text-border-color': '#ccc',
        'text-border-width': 1,
        'text-border-opacity': 1,

    },
};


export const undirectedEdgeStyle = {
    selector: 'edge',
    style: {
        label: 'data(label)',
        'curve-style': 'bezier',
        'target-arrow-shape': 'none',
        'source-arrow-shape': 'none',
        'line-color': '#0f4c5c',
        width: 2,
        'font-size': 10,
        'text-rotation': 'autorotate',
        'text-background-color': '#fff',
        'text-background-opacity': 1,
        'text-background-shape': 'roundrectangle',
        'text-border-color': '#ccc',
        'text-border-width': 1,
        'text-border-opacity': 1,
    },
};
