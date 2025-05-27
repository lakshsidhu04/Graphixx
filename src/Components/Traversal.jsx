import React, { useRef, useEffect, useState, use } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import Button from 'react-bootstrap/Button';

const Traversal = () => {
    const cyRef = useRef(null);
    const defaultGraph = [
        { data: { id: 'A', label: 'A' } },
        { data: { id: 'B', label: 'B' } },
        { data: { id: 'C', label: 'C' } },
        { data: { id: 'AB', source: 'A', target: 'B', label: '' } },
        { data: { id: 'AC', source: 'A', target: 'C', label: '' } }
    ];
    
    const [traversal, setTraversal] = useState(null);
    const [startNode, setStartNode] = useState(null);
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
            'background-color': '#14213D',
            color: '#fff',
            'text-outline-width': 2,
            'text-outline-color': '#14213D',
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
            'target-arrow-color': '#FCA311',
            'line-color': '#FCA311',
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
            'line-color': '#FCA311',
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



    const handleDFSUsingCY = async () => {
        const cy = cyRef.current;
        if (!cy || !startNode) {
            alert('Please select a start node and ensure the graph is loaded.');
            return;
        }

        cy.nodes().removeClass('current in-path visited');

        const events = [];
        cy.elements().dfs({
            root: `#${startNode}`,
            directed: false,

            visit: (node, edge, prev, i, depth) => {
                events.push({ type: 'visit', node });
            },

            exit: (node, edge, prev, i, depth) => {
                events.push({ type: 'exit', node });
            },

            order: 'pre'
        });
        console.log('DFS Events:', events);
        const sleep = ms => new Promise(res => setTimeout(res, ms));
        for (let evt of events) {
            const n = evt.node;
            if (evt.type === 'visit') {
                n.addClass('current');
                await sleep(400);

                n.removeClass('current').addClass('in-path');
                await sleep(200);

            } else {
                n.removeClass('in-path').addClass('visited');
                await sleep(200);
            }
        }
    };

    const handleDFS = async () => {
        const cy = cyRef.current;
        if (!cy || !startNode) {
            alert('Please select a start node and ensure the graph is loaded.');
            return;
        }

        cy.nodes().removeClass('visited in-path current');

        const visited = new Set();
        const sleep = ms => new Promise(res => setTimeout(res, ms));

        // helper to get neighbors based on directed vs undirected
        const getNeighbors = node => {
            if (graphState === 'Directed') {
                // only follow outgoing edges
                return node.outgoers('edge').map(e => e.target());
            } else {
                // follow all edges, pick the other end
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

            // 1) enter = green
            node.addClass('current');
            await sleep(500);

            // 2) on-stack = yellow
            node.removeClass('current').addClass('in-path');

            // 3) recurse
            const neighbors = getNeighbors(node);
            for (const nbr of neighbors) {
                if (!visited.has(nbr.id())) {
                    await dfs(nbr);
                }
            }

            // 4) exit = black
            node.removeClass('in-path').addClass('visited');
            await sleep(300);
        };

        // kick off
        await dfs(cy.getElementById(startNode));
        // clean up any lingering in-path
        cy.nodes('.in-path').removeClass('in-path');
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
                            <h3 style={{ color: '#14213D', marginBottom: '12px' }}>Graph Traversal</h3>
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
                            <h4 style={{ color: '#14213D' }}>{traversal} Traversal</h4>
                            <Button
                                variant="outline-secondary"
                                onClick={() => setTraversal(null)}
                                style={{ marginTop: '10px' }}
                            >
                                Reset
                            </Button>
                            {/* make start node compulsory field*/}
                            <form action="">
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
                                <Button
                                    variant="primary"
                                    onClick={() => handleDFS()}
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

// Reusable zoom button style
const zoomBtnStyle = {
    padding: '8px 12px',
    backgroundColor: '#FCA311',
    color: '#14213D',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '20px',
    minWidth: '40px',
};

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

export default Traversal;
