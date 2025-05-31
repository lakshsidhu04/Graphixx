export const nodeTap = (event,selectedNodesRef,setSelectedNodes,setConnectionMessage,setElements) => {
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
}

export const edgeTap = (event) => {
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
}