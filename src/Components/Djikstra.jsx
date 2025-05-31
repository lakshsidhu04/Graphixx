import { useState, useEffect, useRef } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { defaultGraph } from '../constants/graphConfig';
import {
    directedEdgeStyle,
    undirectedEdgeStyle,
    nodeStyle,
    buttonStyle,
    formStyle,
    inputStyle,
    submitBtnStyle,
    cancelBtnStyle,
    graphContainerStyle,
    zoomControlStyle,
    zoomBtnStyle
} from '../constants/Styles';

const Djikstra = () => {
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

    const [connectionMessage, setConnectionMessage] = useState('');
    const [selectedNodes, setSelectedNodes] = useState([]);
    const selectedNodesRef = useRef([]);

    const [startNode, setStartNode] = useState('');
    const [distances, setDistances] = useState({});

    const toggleGraphType = () => {
        setGraphState(type => (type === 'Directed' ? 'Undirected' : 'Directed'));
    };

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
                    selectedNodesRef.current = [node];
                    setSelectedNodes([node]);
                    setConnectionMessage(`Node "${nodeId}" selected. Click another node to connect.`);
                } else if (selected.length === 1) {
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
                            data: { id: edgeId, source, target, weight, label: `${weight}` }
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

    const runDijkstra = () => {
        const cy = cyRef.current;
        if (!cy || !startNode) {
            alert("Please enter a valid start node.");
            return;
        }

        // Check all edges have numeric and finite weights
        const allEdgesHaveValidWeights = cy.edges().every(e => {
            const w = Number(e.data('weight'));
            return !isNaN(w) && isFinite(w);
        });

        if (!allEdgesHaveValidWeights) {
            alert("All edges must have valid numeric weights before running Dijkstra.");
            return;
        }

        // Check for negative weights
        const hasNegativeWeight = cy.edges().some(e => Number(e.data('weight')) < 0);
        if (hasNegativeWeight) {
            alert("Graph contains negative weight edges. Dijkstra's algorithm cannot be used.");
            return;
        }

        const dist = {};
        const visited = new Set();
        const pq = new Set();

        cy.nodes().forEach(n => {
            const id = n.id();
            dist[id] = Infinity;
            pq.add(id);
        });

        if (!dist.hasOwnProperty(startNode)) {
            alert(`Start node "${startNode}" does not exist in the graph.`);
            return;
        }

        dist[startNode] = 0;

        while (pq.size) {
            let minNode = null;
            let minDist = Infinity;
            for (const node of pq) {
                if (dist[node] < minDist) {
                    minDist = dist[node];
                    minNode = node;
                }
            }

            if (minNode === null) break;

            pq.delete(minNode);
            visited.add(minNode);

            const neighborEdges = cy.edges().filter(e => {
                const source = e.source().id();
                const target = e.target().id();

                if (graphState === 'Directed') {
                    return source === minNode;
                } else {
                    return source === minNode || target === minNode;
                }
            });

            neighborEdges.forEach(e => {
                const source = e.source().id();
                const target = e.target().id();
                const weight = Number(e.data('weight'));

                const neighbor =
                    graphState === 'Directed'
                        ? target
                        : source === minNode
                            ? target
                            : source;

                if (!visited.has(neighbor) && dist[minNode] + weight < dist[neighbor]) {
                    dist[neighbor] = dist[minNode] + weight;
                }
            });
        }

        setDistances(dist);
    };


    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#E5E5E5' }}>
            <div style={{ width: '25%', padding: '20px', borderRight: '1px solid #ccc', backgroundColor: '#F7F7F7' }}>
                <h2 style={{ textAlign: 'center' }}>Dijkstra</h2>
                <label>Start Node:</label>
                <input
                    type="text"
                    value={startNode}
                    onChange={(e) => setStartNode(e.target.value)}
                    placeholder="Enter node ID"
                    style={{ width: '100%', padding: '5px', marginBottom: '10px' }}
                />
                <button
                    onClick={runDijkstra}
                    style={{
                        width: '100%',
                        padding: '10px 15px',
                        background: 'linear-gradient(135deg, #007bff 0%, #00c6ff 100%)',
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 8px rgba(0, 123, 255, 0.2)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease-in-out',
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 123, 255, 0.3)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 123, 255, 0.2)';
                    }}
                >
                    Run Dijkstra
                </button>


                {Object.keys(distances).length > 0 && (
                    <>
                        <h3
                            style={{
                                marginTop: '20px',
                                textAlign: 'center',
                                background: 'linear-gradient(to right, #007bff, #00c6ff)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                fontSize: '1.3rem',
                                fontWeight: 'bold',
                            }}
                        >
                            Distance from {startNode}
                        </h3>
                        <ul
                            style={{
                                listStyle: 'none',
                                padding: 0,
                                marginTop: '12px',
                                maxHeight: '220px',
                                overflowY: 'auto',
                                borderRadius: '10px',
                                backgroundColor: '#fdfdfd',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                                border: '1px solid #ddd',
                            }}
                        >
                            {Object.entries(distances).map(([node, d], index) => (
                                <li
                                    key={node}
                                    style={{
                                        padding: '12px 18px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        backgroundColor: index % 2 === 0 ? '#fafafa' : '#f0f8ff',
                                        fontWeight: d === 0 ? 'bold' : 'normal',
                                        color: d === Infinity ? '#999' : '#333',
                                        borderBottom: index !== Object.entries(distances).length - 1 ? '1px solid #eee' : 'none',
                                        transition: 'background 0.3s',
                                        cursor: 'default',
                                    }}
                                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e0f7ff')}
                                    onMouseOut={(e) =>
                                    (e.currentTarget.style.backgroundColor =
                                        index % 2 === 0 ? '#fafafa' : '#f0f8ff')
                                    }
                                >
                                    <span>
                                        <strong>Node {node}</strong>
                                    </span>
                                    <span>{d === Infinity ? '∞' : d}</span>
                                </li>
                            ))}
                        </ul>
                    </>
                )}


            </div>

            <div style={{ width: '85%', padding: '20px' }}>
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
        </div>
    );
};

export default Djikstra;
