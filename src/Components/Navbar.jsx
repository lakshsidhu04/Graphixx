import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

function BasicExample() {
    return (
        <Navbar
            expand="lg"
            className="bg-body-tertiary"
            style={{ borderBottom: '2px solid #000000' }}
        >
            <Container>
                <Navbar.Brand href="#home">Graphixx</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link href="/">Home</Nav.Link>
                        <Nav.Link href="/traversal">Traversal</Nav.Link>
                        {/* <NavDropdown title="Traversal" id="basic-nav-dropdown">
                            <NavDropdown.Item href="/traversal/bfs">BFS</NavDropdown.Item>
                            <NavDropdown.Item href="/traversal/dfs">DFS</NavDropdown.Item>
                            <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                        </NavDropdown> */}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default BasicExample;
