import React, { useRef, useEffect, useState, use } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import Button from 'react-bootstrap/Button';
import { defaultGraph } from '../constants/graphConfig';
import Legend from '../constants/Legends';
import { zoomBtnStyle, buttonStyle } from '../constants/Styles';

const Traversal = () => {
    const cyRef = useRef(null);

    const [traversal, setTraversal] = useState(null);
    const [startNode, setStartNode] = useState(null);
    const [topoElements, setTopoElements] = useState([]);
    const [elements, setElements] = useState(() => {
        const saved = window.localStorage.getItem('graphElements');
        return saved ? JSON.parse(saved) : defaultGraph;
    });

    const [graphState, setGraphState] = useState(() => {
        try {
            const savedState = window.localStorage.getItem('graphState');
            return savedState ? JSON.parse(savedState) : 'Directed';
        } catch (e) {
            return 'Directed';
        }
    });

    useEffect(() => {
        window.localStorage.setItem('graphElements', JSON.stringify(elements));
        window.localStorage.setItem('graphState', graphState);
    }, [elements, graphState]);


    const toggleGraphType = () => {
        setGraphState(type => (type === 'Directed' ? 'Undirected' : 'Directed'));
    };

    const nodeStyle = {
        selector: 'node',
        style: {
            label: 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'background-color': '#EF233C',
            color: '#EDF2F4',
            'text-outline-width': 2,
            'text-outline-color': '#2B2D42',
            width: 50,
            height: 50,
        },
    };

    const directedEdgeStyle = {
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
        },
    };

    const undirectedEdgeStyle = {
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
        },
    };

    const stylesheet = [
        nodeStyle,
        (graphState === 'Directed' ? directedEdgeStyle : undirectedEdgeStyle),
        {
            selector: '.current',
            style: {
                'background-color': 'green',
            },
        },
        {
            selector: '.in-path',
            style: {
                'background-color': 'yellow',
            },
        },
        {
            selector: '.visited',
            style: {
                'background-color': 'black',
            },
        }
    ];

    const layout = { name: 'cose', animate: true };

    useEffect(() => {
        const cy = cyRef.current;
        if (cy) cy.ready(() => cy.fit());
    }, []);

    const handleTraversal = () => {
        if (traversal === 'DFS') {
            handleDFS();
        } else if (traversal === 'BFS') {
            handleBFS();
        } else if (traversal === 'Topo') {
            handleTopo();
        }
    }

    const handleDFS = async () => {
        const cy = cyRef.current;
        if (!cy || !startNode) {
            alert('Please select a start node and ensure the graph is loaded.');
            return;
        }

        cy.nodes().removeClass('visited in-path current');

        const visited = new Set();
        const sleep = ms => new Promise(res => setTimeout(res, ms));

        const getNeighbors = node => {
            if (graphState === 'Directed') {
                return node.outgoers('edge').map(e => e.target());
            } else {
                return node.connectedEdges().map(e => {
                    const src = e.source();
                    const tgt = e.target();
                    return src.id() === node.id() ? tgt : src;
                });
            }
        };

        const dfs = async node => {
            if (visited.has(node.id())) return;
            visited.add(node.id());
            node.addClass('current');

            await sleep(500);

            node.removeClass('current').addClass('in-path');

            const neighbors = getNeighbors(node);
            for (const nbr of neighbors) {
                if (!visited.has(nbr.id())) {
                    await dfs(nbr);
                }
            }

            node.removeClass('in-path').addClass('visited');
            await sleep(300);
        };

        await dfs(cy.getElementById(startNode));
        await new Promise(resolve => setTimeout(resolve, 500));
        cy.nodes('.in-path').removeClass('in-path');
        cy.nodes('.current').removeClass('current');
        cy.nodes('.visited').removeClass('visited');
    };

    const handleBFS = async () => {
        const cy = cyRef.current;
        if (!cy || !startNode) {
            alert('Please select a start node and ensure the graph is loaded.');
            return;
        }

        cy.nodes().removeClass('visited in-path current');

        const visited = new Set();
        const sleep = ms => new Promise(res => setTimeout(res, ms));
        const queue = [];

        const getNeighbors = node => {
            if (graphState === 'Directed') {
                return node.outgoers('edge').map(e => e.target());
            } else {
                return node.connectedEdges().map(e => {
                    const src = e.source();
                    const tgt = e.target();
                    return src.id() === node.id() ? tgt : src;
                });
            }
        };

        const bfs = async (start) => {
            visited.add(start.id());
            start.addClass('in-path');
            queue.push(start);

            while (queue.length > 0) {
                const node = queue.shift();
                node.removeClass('in-path').addClass('current');
                await sleep(1000);

                const neighbors = getNeighbors(node);
                for (const nbr of neighbors) {
                    if (!visited.has(nbr.id())) {
                        visited.add(nbr.id());
                        queue.push(nbr);
                        nbr.addClass('in-path');
                    }
                }

                await sleep(1000);
                node.removeClass('current').addClass('visited');
            }
        };

        await bfs(cy.getElementById(startNode));

        await sleep(500);
        cy.nodes().removeClass('visited in-path current');
    };


    const handleTopo = () => {
        const cy = cyRef.current;
        cy.nodes().removeClass('visited in-path current');

        if (graphState === 'Undirected') {
            alert("Topological sort can't be implemented on an undirected graph.");
            return;
        }

        const visited = new Set();
        const stack = [];

        const getNeighbors = node => node.outgoers('edge').map(e => e.target());

        const topoSort = (node) => {
            if (visited.has(node.id())) return;
            visited.add(node.id());

            const neighbors = getNeighbors(node);
            for (const nbr of neighbors) {
                if (!visited.has(nbr.id())) {
                    topoSort(nbr);
                }
            }

            stack.push(node);
        };

        const nodes = cy.nodes();
        for (const node of nodes) {
            if (!visited.has(node.id())) {
                topoSort(node);
            }
        }

        const topoOrder = stack.reverse();

        const elements = topoOrder.map(node => ({
            data: { id: node.id(), label: node.id() }
        }));

        for (let i = 0; i < topoOrder.length - 1; i++) {
            elements.push({
                data: {
                    id: `e${i}`,
                    source: topoOrder[i].id(),
                    target: topoOrder[i + 1].id()
                }
            });
        }

        setTopoElements(elements);
    };

    const clearTopoGraph = () => {
        setTopoElements([]);
    };



    return (
        <div style={{
            display: 'flex',
            height: '100vh',
            backgroundColor: '#F5F5F5',
            fontFamily: 'Arial, sans-serif',
        }}>
            <div style={{
                width: '20%',
                backgroundColor: '#ffffff',
                borderRight: '1px solid #ccc',
                padding: '30px 20px',
                boxShadow: '2px 0 5px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
            }}>
                <div>
                    {
                        !traversal && (
                            <h3 style={{ color: '#2B2D42', marginBottom: '12px' }}>Graph Traversal</h3>
                        )

                    }

                    {
                        !traversal && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <Button variant="outline-success" onClick={() => setTraversal('DFS')}>
                                    Depth-First Search
                                </Button>
                                <Button variant="outline-primary" onClick={() => setTraversal('BFS')}>
                                    Breadth-First Search
                                </Button>
                                <Button variant="outline-info" onClick={() => setTraversal('Topo')}>
                                    Topological Sort
                                </Button>
                            </div>

                        )
                    }
                    {traversal && (
                        <div style={{ marginTop: '40px', textAlign: 'center' }}>
                            <h4 style={{ color: '#2B2D42' }}>{traversal} Traversal</h4>
                            <Button
                                variant="outline-secondary"
                                onClick={() => { setTraversal(null); setStartNode(null); setTopoElements([]); }}
                                style={{ marginTop: '10px' }}
                            >
                                Reset
                            </Button>

                            <form action="">
                                {(traversal === 'DFS' || traversal === 'BFS') && (
                                    <div style={{ marginTop: '20px' }}>
                                        <label htmlFor="startNode" style={{ display: 'block', marginBottom: '10px' }}>
                                            Start Node:
                                        </label>
                                        <input
                                            type="text"
                                            id="startNode"
                                            value={startNode || ''}
                                            required
                                            onChange={(e) => setStartNode(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '8px',
                                                borderRadius: '4px',
                                                border: '1px solid #ccc',
                                            }}
                                        />
                                    </div>
                                )}

                                <Button
                                    variant="primary"
                                    onClick={() => handleTraversal()}
                                    style={{ marginTop: '20px' }}
                                >
                                    Start Traversal
                                </Button>
                            </form>
                        </div>
                    )}

                </div>

            </div>

            <div style={{ width: '80%', padding: '20px' }}>
                {topoElements.length > 0 && (
                    <div
                        style={{
                            width: '100%',
                            height: '250px',
                            backgroundColor: '#fff',
                            borderRadius: '8px',
                            border: '1px solid #ccc',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                            marginBottom: '20px',
                            position: 'relative',
                        }}
                    >
                        <h4 style={{ padding: '10px 20px', color: '#2B2D42' }}>
                            Topological Sort Result
                            <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={clearTopoGraph}
                                style={{ float: 'right', marginTop: '5px' }}
                            >
                                Remove
                            </Button>
                        </h4>
                        <CytoscapeComponent
                            elements={topoElements}
                            style={{ width: '100%', height: '200px' }}
                            stylesheet={[
                                {
                                    selector: 'node',
                                    style: {
                                        label: 'data(label)',
                                        'text-valign': 'center',
                                        'text-halign': 'center',
                                        'background-color': '#007bff',
                                        color: '#fff',
                                        width: 40,
                                        height: 40,
                                        'font-size': 14,
                                        'text-wrap': 'wrap',
                                        'text-max-width': 40,
                                    },
                                },
                                {
                                    selector: 'edge',
                                    style: {
                                        width: 2,
                                        'line-color': '#555',
                                        'target-arrow-color': '#555',
                                        'target-arrow-shape': 'triangle',
                                        'curve-style': 'bezier',
                                    },
                                },
                            ]}
                            layout={{
                                name: 'breadthfirst',
                                directed: true,
                                padding: 10,
                                spacingFactor: 2,
                                orientation: 'left-to-right',
                            }}
                        />
                    </div>
                )}

                <div
                    style={{
                        width: '100%',
                        height: '85%',
                        backgroundColor: '#ffffff',
                        borderRadius: '8px',
                        border: '1px solid #ccc',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                        position: 'relative',
                    }}
                >

                    <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10 }}>
                        <Legend />
                    </div>
                    <CytoscapeComponent
                        elements={elements}
                        stylesheet={stylesheet}
                        layout={layout}
                        style={{
                            width: '100%',
                            height: '100%',
                            backgroundColor: '#fff',
                            borderRadius: '8px',
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
                            style={zoomBtnStyle}
                        >
                            +
                        </button>
                        <button
                            onClick={() => cyRef.current && cyRef.current.zoom(cyRef.current.zoom() / 1.2)}
                            style={zoomBtnStyle}
                        >
                            –
                        </button>
                        <button
                            onClick={() => cyRef.current && cyRef.current.fit()}
                            style={zoomBtnStyle}
                        >
                            Reset
                        </button>
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



export default Traversal;
