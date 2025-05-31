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
                <Navbar.Brand href="/">Graphixx</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link href="/">Home</Nav.Link>
                        <Nav.Link href="/traversal">Traversal</Nav.Link>
                        <NavDropdown title="Algorithms" id="basic-nav-dropdown">
                            <NavDropdown.Item href="/algorithms/djikstra">Djikstra</NavDropdown.Item>
                            <NavDropdown.Item href="/algorithms/bellman">Bellman Ford</NavDropdown.Item>
                        </NavDropdown>
                        <NavDropdown title="Connectivity" id="basic-nav-dropdown">
                            <NavDropdown.Item href="/conn/scc">SCCs</NavDropdown.Item>
                            <NavDropdown.Item href="/algorithms/bellman">Bellman Ford</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default BasicExample;
