import React, { useRef, useEffect, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';

const GraphComponent = () => {
    const cyRef = useRef(null);

    const defaultGraph = [
        { data: { id: 'A', label: 'A' } },
        { data: { id: 'B', label: 'B' } },
        { data: { id: 'C', label: 'C' } },
        { data: { id: 'AB', source: 'A', target: 'B', label: '' } },
        { data: { id: 'AC', source: 'A', target: 'C', label: '' } },
    ];

    // Load from localStorage or fall back
    const [elements, setElements] = useState(() => {
        const saved = window.localStorage.getItem('graphElements');
        return saved ? JSON.parse(saved) : defaultGraph;
    });

    // Persist whenever elements change
    useEffect(() => {
        window.localStorage.setItem('graphElements', JSON.stringify(elements));
    }, [elements]);

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

    // Fit viewport on ready
    useEffect(() => {
        const cy = cyRef.current;
        if (cy) cy.ready(() => cy.fit());
    }, []);

    // Form state
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
    const handleChange = e => {
        setFormData(d => ({ ...d, [e.target.name]: e.target.value }));
    };
    const handleCancel = () => {
        setFormType(null);
    };

    const handleSubmit = e => {
        e.preventDefault();
        if (formType === 'node') {
            const { id, label } = formData;
            if (!elements.find(el => el.data.id === id)) {
                setElements(es => [
                    ...es,
                    { data: { id, label: label || id } },
                ]);
            } else {
                alert(`Node "${id}" already exists.`);
            }
        } else if (formType === 'edge') {
            const { source, target, label } = formData;
            const edgeId = `${source}-${target}-${Date.now()}`;
            setElements(es => [
                ...es,
                { data: { id: edgeId, source, target, label } },
            ]);
        }
        setFormType(null);
    };

    return (
        <div>
            <h1 style={{ textAlign: 'center', color: '#14213D' }}>
                Graph Visualization
            </h1>

            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <button
                    onClick={openNodeForm}
                    style={{
                        marginRight: '10px',
                        padding: '8px 16px',
                        backgroundColor: '#000',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '20px',
                    }}
                >
                    Add Node
                </button>
                <button
                    onClick={openEdgeForm}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#000',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '20px',
                    }}
                >
                    Add Edge
                </button>
            </div>

            {formType && (
                <form
                    onSubmit={handleSubmit}
                    style={{
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
                    }}
                >
                    {formType === 'node' ? (
                        <>
                            <input
                                name="id"
                                placeholder="Node ID"
                                value={formData.id}
                                onChange={handleChange}
                                required
                                style={{ padding: '6px', width: '100px' }}
                            />
                            <input
                                name="label"
                                placeholder="Label (optional)"
                                value={formData.label}
                                onChange={handleChange}
                                style={{ padding: '6px', width: '150px' }}
                            />
                        </>
                    ) : (
                        <>
                            <input
                                name="source"
                                placeholder="Source ID"
                                value={formData.source}
                                onChange={handleChange}
                                required
                                style={{ padding: '6px', width: '100px' }}
                            />
                            <input
                                name="target"
                                placeholder="Target ID"
                                value={formData.target}
                                onChange={handleChange}
                                required
                                style={{ padding: '6px', width: '100px' }}
                            />
                            <input
                                name="label"
                                placeholder="Label (optional)"
                                value={formData.label}
                                onChange={handleChange}
                                style={{ padding: '6px', width: '150px' }}
                            />
                        </>
                    )}
                    <button
                        type="submit"
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#14213D',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }}
                    >
                        Submit
                    </button>
                    <button
                        type="button"
                        onClick={handleCancel}
                        style={{
                            padding: '8px 12px',
                            backgroundColor: '#ccc',
                            color: '#333',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }}
                    >
                        Cancel
                    </button>
                </form>
            )}

            <div
                style={{
                    width: '60%',
                    height: '600px',
                    backgroundColor: '#E5E5E5',
                    margin: '0 auto 40px',
                    borderRadius: '8px',
                    border: '1px solid #ccc',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    position: 'relative',
                }}
            >
                <CytoscapeComponent
                    elements={elements}
                    stylesheet={stylesheet}
                    layout={layout}
                    style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    }}
                    cy={cy => (cyRef.current = cy)}
                />

                <div
                    style={{
                        position: 'absolute',
                        bottom: '20px',
                        right: '20px',
                        display: 'flex',
                        gap: '10px',
                    }}
                >
                    <button
                        onClick={() => cyRef.current && cyRef.current.zoom(cyRef.current.zoom() * 1.2)}
                        style={{
                            padding: '8px 12px',
                            backgroundColor: '#FCA311',
                            color: '#14213D',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '24px',
                        }}
                    >
                        +
                    </button>
                    <button
                        onClick={() => cyRef.current && cyRef.current.zoom(cyRef.current.zoom() / 1.2)}
                        style={{
                            padding: '8px 12px',
                            backgroundColor: '#FCA311',
                            color: '#14213D',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '24px',
                        }}
                    >
                        –
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GraphComponent;
