import React, { useRef, useEffect, useState } from 'react';
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
    
    const handleDFS = async () => {
        const cy = cyRef.current;
        if (!cy || !startNode) {
            alert('Please select a start node and ensure the graph is loaded.');
            return;
        }
        
        if(!startNode){
            alert('Please enter a start node.');
            return;
        }

        console.log('Starting DFS from node:', startNode);
        
        cy.nodes().removeClass('visited');
        cy.nodes().removeClass('in-path');
        cy.nodes().removeClass('current');

        const visited = new Set();
        const inPath = new Set();

        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        const dfs = async (node) => {
            if (visited.has(node.id())) return;
            
            node.addClass('current');
            await sleep(500);
            node.removeClass('current');
            node.addClass('in-path');
            inPath.add(node.id());
            
            const neighbors = node.outgoers('edge').map(edge => edge.target());

            console.log(neighbors)

            for (const neighbor of neighbors) {
                if (!visited.has(neighbor.id())) {
                    await dfs(neighbor);
                }
            }

            // Mark as visited (black), remove from in-path
            inPath.delete(node.id());
            node.removeClass('in-path');
            node.addClass('visited');
            await sleep(300);
        };

        // Start DFS
        await dfs(cy.getElementById(startNode));
        // Reset in-path nodes after traversal
        inPath.forEach(id => cy.getElementById(id).removeClass('in-path'));
        // Optionally, you can reset the current node class after traversal
        cy.nodes().removeClass('current');
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
                        height: '93%',
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

export default Traversal;
