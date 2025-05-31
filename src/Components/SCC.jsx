import React, { useRef, useEffect, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { defaultGraph } from '../constants/graphConfig';
import { directedEdgeStyle, undirectedEdgeStyle, nodeStyle, buttonStyle, formStyle, inputStyle, submitBtnStyle, cancelBtnStyle, graphContainerStyle, zoomControlStyle, zoomBtnStyle } from '../constants/Styles';
const SCC = () => {
    const cyRef = useRef(null);

    useEffect(() => {
        if (!localStorage.getItem('graphElements')) {
            localStorage.setItem('graphElements', JSON.stringify(defaultGraph));
        }
    }, []);
    
    const [colors, setColors] = useState([
        "#2d00f7", "#a100f2", "#f20089", "#ff4800", "#ffaa00", "#ff0000", "#1a8fe3", "#04e762", "#89fc00","#00ffff"])
    
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

    useEffect(() => {
        const cy = cyRef.current;
        if (!cy) return;

        cy.ready(() => {
            cy.fit();
            
            if (graphState !== 'Directed') {
                setGraphState('Directed');
            }
            
            const nodes = cy.nodes().map(n => n.id());
            const adj = new Map(nodes.map(id => [id, []]));
            const revAdj = new Map(nodes.map(id => [id, []]));

            cy.edges().forEach(edge => {
                const src = edge.source().id();
                const tgt = edge.target().id();
                adj.get(src).push(tgt);
                revAdj.get(tgt).push(src);
            });
            
            const visited = new Set();
            const stack = [];

            const dfs1 = (v) => {
                visited.add(v);
                for (const u of adj.get(v)) {
                    if (!visited.has(u)) dfs1(u);
                }
                stack.push(v);
            };

            for (const v of nodes) {
                if (!visited.has(v)) dfs1(v);
            }

            visited.clear();
            const components = [];
            const dfs2 = (v, comp) => {
                visited.add(v);
                comp.push(v);
                for (const u of revAdj.get(v)) {
                    if (!visited.has(u)) dfs2(u, comp);
                }
            };

            while (stack.length > 0) {
                const v = stack.pop();
                if (!visited.has(v)) {
                    const comp = [];
                    dfs2(v, comp);
                    components.push(comp);
                }
            }
            
            components.forEach((comp, i) => {
                const color = colors[i % colors.length];
                comp.forEach(id => {
                    const node = cy.getElementById(id);
                    node.style('background-color', color);
                });
            });
        });
    }, [cyRef, colors, graphState,elements]);


    return (
        <div style={{ padding: '20px', backgroundColor: '#E5E5E5' }}>


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
        
        </div>
    );
};


export default SCC;
