import React, { useRef, useEffect, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';

const GraphComponent = () => {
    const cyRef = useRef(null);
    
    const defaultGraph = [
        { data: { id: 'A', label: 'A' } },
        { data: { id: 'B', label: 'B' } },
        { data: { id: 'C', label: 'C' } },
        { data: { id: 'AB', source: 'A', target: 'B', label: ' ' } },
        { data: { id: 'AC', source: 'A', target: 'C', label: ' ' } }
    ];
    
    useEffect(() => {
        // Only do this once to reset bugs from saved data
        if (!localStorage.getItem('graphElements')) {
            localStorage.setItem('graphElements', JSON.stringify(defaultGraph));
        }
    }, []);
    
    
    const [graphState, setGraphState] = useState(() => {
        try {
            const savedState = window.localStorage.getItem('graphState');
            return savedState ? JSON.parse(savedState) : 'Directed';
        } catch (e) {
            return 'Directed';
        }
    });

    const [elements, setElements] = useState(() => {
        const saved = window.localStorage.getItem('graphElements');
        return saved ? JSON.parse(saved) : defaultGraph;
    });
    
    
    // const toggleGraphType = () => {
    //     const newType = graphType === "Directed" ? "Undirected" : "Directed";
    //     setGraphType(newType);
    //     setGraphState(newType);
        
    //     if (newType === "Undirected") {
    //         const newElements = [...elements];
    //         elements.forEach(el => {
    //             if (el.data.source && el.data.target) {
    //                 const reverseExists = elements.some(
    //                     e => e.data.source === el.data.target && e.data.target === el.data.source
    //                 );
    //                 if (!reverseExists) {
    //                     const reverseEdge = {
    //                         data: {
    //                             id: `rev-${el.data.target}-${el.data.source}-${Date.now()}`,
    //                             source: el.data.target,
    //                             target: el.data.source,
    //                             label: el.data.label || ''
    //                         }
    //                     };
    //                     newElements.push(reverseEdge);
    //                 }
    //             }
    //         });
    //         setElements(newElements);
    //     } else {
    //         // Filter out reverse edges to simulate directed behavior
    //         const filtered = elements.filter(el => {
    //             if (el.data.source && el.data.target) {
    //                 // Keep only one direction of each edge
    //                 return el.data.source <= el.data.target;
    //             }
    //             return true;
    //         });
    //         setElements(filtered);
    //     }
    // };
    
    
    useEffect(() => {
        window.localStorage.setItem('graphElements', JSON.stringify(elements));
        window.localStorage.setItem('graphState', graphState); // use graphType not graphState
    }, [elements, graphState]);
    
    const stylesheet = [
        {
            selector: 'node',
            style: {
                label: 'data(label)',
                'text-valign': 'center',
                'text-halign': 'center',
                'background-color': '#14213D',
                color: '#fff',
                'text-outline-width': 2,
                'text-outline-color': '#14213D',
                width: 50,
                height: 50,
            },
        },
        {
            selector: 'edge',
            style: {
                label: 'data(label)',
                'curve-style': 'bezier',
                'target-arrow-shape': 'triangle',
                'target-arrow-color': '#FCA311',
                'line-color': '#FCA311',
                width: 2,
                'font-size': 10,
                'text-rotation': 'autorotate',
            },
        },
    ];

    const layout = { name: 'cose', animate: true };

    useEffect(() => {
        const cy = cyRef.current;
        if (cy) cy.ready(() => cy.fit());
    }, []);

    const [formType, setFormType] = useState(null);
    const [formData, setFormData] = useState({});

    const openNodeForm = () => {
        setFormType('node');
        setFormData({ id: '', label: '' });
    };

    const openEdgeForm = () => {
        setFormType('edge');
        setFormData({ source: '', target: '', label: '' });
    };
    
    const openRemoveNodeForm = () => {
        setFormType('removeNode');
        setFormData({ id: '' });
    };
    
    const openRemoveEdgeForm = () => {
        setFormType('removeEdge');
        setFormData({ source: '', target: '' });
    };

    const handleChange = (e) => {
        setFormData((d) => ({ ...d, [e.target.name]: e.target.value }));
    };

    const handleCancel = () => {
        setFormType(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (formType === 'node') {
            const { id, label } = formData;
            if (!elements.find(el => el.data.id === id)) {
                setElements(es => [...es, { data: { id, label: label || id } }]);
            } else {
                alert(`Node "${id}" already exists.`);
            }

        } else if (formType === 'edge') {
            const { source, target, label } = formData;
            const hasSource = elements.some(el => el.data.id === source);
            const hasTarget = elements.some(el => el.data.id === target);
            if (!hasSource || !hasTarget) {
                alert(
                    `Cannot add edge: ` +
                    `${!hasSource ? `"${source}"` : ''}` +
                    `${!hasSource && !hasTarget ? ' and ' : ''}` +
                    `${!hasTarget ? `"${target}"` : ''}` +
                    ` node(s) do not exist.`
                );
                setFormType(null);
                return;
            }
            const edgeId = `${source}-${target}-${Date.now()}`;
            setElements(es => [...es, { data: { id: edgeId, source, target, label } }]);

        } else if (formType === 'removeNode') {
            const { id } = formData;
            const exists = elements.some(el => el.data.id === id);
            if (!exists) {
                alert(`Node "${id}" does not exist.`);
            } else {
                setElements(es =>
                    es.filter(el =>
                        el.data.id !== id &&
                        el.data.source !== id &&
                        el.data.target !== id
                    )
                );
            }

        } else if (formType === 'removeEdge') {
            const { source, target } = formData;
            const matching = elements.filter(el =>
                el.data.source === source && el.data.target === target
            );
            if (matching.length === 0) {
                alert(`Edge from "${source}" to "${target}" not found.`);
            } else {
                setElements(es =>
                    es.filter(el =>
                        !(el.data.source === source && el.data.target === target)
                    )
                );
            }
        }

        setFormType(null);
    };
    
    
    return (
        <div style={{ padding: '20px', backgroundColor: '#E5E5E5' }}>
            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <button onClick={openNodeForm} style={{ ...buttonStyle, backgroundColor: '#04e762'}}>Add Node</button>
                <button onClick={openEdgeForm} style={{ ...buttonStyle, backgroundColor: '#04e762' }}>Add Edge</button>
                <button onClick={openRemoveNodeForm} style={{ ...buttonStyle, backgroundColor: '#ff0022' }}>Remove Node</button>
                <button onClick={openRemoveEdgeForm} style={{ ...buttonStyle, backgroundColor: '#ff0022' }}>Remove Edge</button>
            </div>

            {formType && (
                <form onSubmit={handleSubmit} style={formStyle}>
                    {formType === 'node' && (
                        <>
                            <input
                                name="id"
                                placeholder="Node ID"
                                value={formData.id}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                            />
                            <input
                                name="label"
                                placeholder="Label (optional)"
                                value={formData.label}
                                onChange={handleChange}
                                style={inputStyle}
                            />
                        </>
                    )}

                    {formType === 'edge' && (
                        <>
                            <input
                                name="source"
                                placeholder="Source ID"
                                value={formData.source}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                            />
                            <input
                                name="target"
                                placeholder="Target ID"
                                value={formData.target}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                            />
                            <input
                                name="label"
                                placeholder="Label (optional)"
                                value={formData.label}
                                onChange={handleChange}
                                style={inputStyle}
                            />
                        </>
                    )}

                    {formType === 'removeNode' && (
                        <input
                            name="id"
                            placeholder="Node ID to Remove"
                            value={formData.id}
                            onChange={handleChange}
                            required
                            style={inputStyle}
                        />
                    )}

                    {formType === 'removeEdge' && (
                        <>
                            <input
                                name="source"
                                placeholder="Source ID"
                                value={formData.source}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                            />
                            <input
                                name="target"
                                placeholder="Target ID"
                                value={formData.target}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                            />
                        </>
                    )}

                    <button type="submit" style={submitBtnStyle}>Submit</button>
                    <button type="button" onClick={handleCancel} style={cancelBtnStyle}>Cancel</button>
                </form>
            )}

            <div style={graphContainerStyle}>
                <CytoscapeComponent
                    elements={elements}
                    stylesheet={stylesheet}
                    layout={layout}
                    style={{ width: '100%', height: '100%', backgroundColor: '#fff', borderRadius: '8px' }}
                    cy={(cy) => (cyRef.current = cy)}
                />
                <div style={zoomControlStyle}>
                    <button onClick={() => cyRef.current.zoom(cyRef.current.zoom() * 1.2)} style={zoomBtnStyle}>+</button>
                    <button onClick={() => cyRef.current.zoom(cyRef.current.zoom() / 1.2)} style={zoomBtnStyle}>–</button>
                    <button onClick={() => cyRef.current.fit()} style={zoomBtnStyle}>Reset</button>
                </div>
            </div>
            {/* <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button onClick={toggleGraphType} style={buttonStyle}>
                    {graphType === "Directed" ? "Switch to Undirected" : "Switch to Directed"}
                </button>
                <span style={{ fontSize: '20px', color: '#333' }}>
                    Current Graph Type: {graphType}
                </span>
            </div> */}
        </div>
    );
};

// --- Styles ---
const buttonStyle = {
    marginRight: '10px',
    padding: '8px 16px',
    backgroundColor: '#000',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '20px',
};

const formStyle = {
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

const inputStyle = {
    padding: '6px',
    width: '150px',
};

const submitBtnStyle = {
    padding: '8px 16px',
    backgroundColor: '#14213D',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
};

const cancelBtnStyle = {
    padding: '8px 12px',
    backgroundColor: '#ccc',
    color: '#333',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
};

const graphContainerStyle = {
    width: '60%',
    height: '600px',
    backgroundColor: '#E5E5E5',
    margin: '0 auto 40px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    position: 'relative',
};

const zoomControlStyle = {
    position: 'absolute',
    bottom: '20px',
    right: '20px',
    display: 'flex',
    gap: '10px',
};

const zoomBtnStyle = {
    padding: '8px 12px',
    backgroundColor: '#FCA311',
    color: '#14213D',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '24px',
};

export default GraphComponent;
