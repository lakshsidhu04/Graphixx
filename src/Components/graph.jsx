import React, { useRef, useEffect, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { defaultGraph } from '../constants/graphConfig';
import { directedEdgeStyle, undirectedEdgeStyle, nodeStyle, buttonStyle, formStyle, inputStyle, submitBtnStyle, cancelBtnStyle, graphContainerStyle, zoomControlStyle, zoomBtnStyle } from '../constants/Styles';
const GraphComponent = () => {
    const cyRef = useRef(null);

    useEffect(() => {
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


    const toggleGraphType = () => {
        setGraphState(type => (type === 'Directed' ? 'Undirected' : 'Directed'));
    };

    const [connectionMessage, setConnectionMessage] = useState('');
    const [selectedNodes, setSelectedNodes] = useState([]);
    const selectedNodesRef = useRef([]);
    


    useEffect(() => {
        window.localStorage.setItem('graphElements', JSON.stringify(elements));
        window.localStorage.setItem('graphState', graphState);
    }, [elements, graphState]);


    const stylesheet = [
        nodeStyle,
        graphState === 'Directed' ? directedEdgeStyle : undirectedEdgeStyle,
        {
            selector: '.selected',
            style: {
                'border-width': 4,
                'border-color': 'black'
            }
        }
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
    
    useEffect(() => {
                const cy = cyRef.current;
                if (!cy) return;
        
                cy.ready(() => {
                    cy.fit();
        
                    cy.on('tap', 'edge', (event) => {
                        const edge = event.target;
                        const currentWeight = edge.data('weight') || 1;
        
                        const newWeight = prompt(`Current weight: ${currentWeight}\nEnter new weight:`, currentWeight);
                        if (newWeight !== null && !isNaN(Number(newWeight))) {
                            const updatedWeight = Number(newWeight);
                            edge.data('weight', updatedWeight);
                            edge.data('label', `${updatedWeight}`);
                            
                            setElements(prevElements =>
                                prevElements.map(el => {
                                    if (el.data.id === edge.id()) {
                                        return {
                                            ...el,
                                            data: {
                                                ...el.data,
                                                weight: updatedWeight,
                                                label: `${updatedWeight}`
                                            }
                                        };
                                    }
                                    return el;
                                })
                            );
                        }
                    });
        
        
        
                    cy.on('tap', 'node', (event) => {
                        const node = event.target;
                        const nodeId = node.id();
        
                        const selected = selectedNodesRef.current;
        
                        // Ignore double select
                        if (selected.find(n => n.id() === nodeId)) return;
        
                        node.addClass('selected');
        
                        if (selected.length === 0) {
                            console.log("First node:", node.id());
                            selectedNodesRef.current = [node];
                            setSelectedNodes([node]);
                            setConnectionMessage(`Node "${nodeId}" selected. Click another node to connect.`);
                        } else if (selected.length === 1) {
                            console.log("Second node selected");
                            const source = selected[0].id();
                            const target = nodeId;
                            const weightInput = prompt("Enter weight for the new edge (default 1):", "1");
                            const weight = weightInput !== null && !isNaN(Number(weightInput)) ? Number(weightInput) : 1;
        
                            const edgeId = `e-${source}-${target}-${Date.now()}`;
        
                            cy.add({
                                group: 'edges',
                                data: {
                                    id: edgeId,
                                    source,
                                    target,
                                    weight,
                                    label: `${weight}`
                                }
                            });
        
                            setElements(prev => [
                                ...prev,
                                {
                                    data: {
                                        id: edgeId,
                                        source,
                                        target,
                                        weight,
                                        label: `${weight}`
                                    }
                                }
                            ]);
        
                            cy.nodes().removeClass('selected');
                            selectedNodesRef.current = [];
                            setSelectedNodes([]);
                            setConnectionMessage('Edge created! Click a node to start a new connection.');
                        }
                    });
                    
                    
                });
        
                return () => {
                    if (cy) {
                        cy.removeListener('tap', 'edge');
                        cy.removeListener('tap', 'node');
                    }
                };
            }, []);
    
    

    

    
    return (
        <div style={{ padding: '20px', backgroundColor: '#E5E5E5' }}>
            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <button onClick={openNodeForm} style={{ ...buttonStyle, backgroundColor: '#04e762' }}>Add Node</button>
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


            {connectionMessage && (
                <div style={{ textAlign: 'center', marginBottom: '10px', fontWeight: 'bold' }}>
                    {connectionMessage}
                    <button
                        onClick={() => {
                            const cy = cyRef.current;
                            cy.nodes().removeClass('selected');
                            setSelectedNodes([]);
                            selectedNodesRef.current = [];
                            setConnectionMessage('');
                            console.log("Connection message cleared");
                        }}
                        style={{ marginLeft: '10px', padding: '5px 10px', background: '#ccc', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        Cancel
                    </button>
                </div>
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
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button onClick={toggleGraphType} style={buttonStyle}>
                    {graphState === "Directed" ? "Switch to Undirected Graph" : "Switch to Directed Graph"}
                </button>
            </div>
        </div>
    );
};


export default GraphComponent;
