import { Container } from "react-bootstrap";
import { HashRouter, Routes, Route } from "react-router-dom";
import { AppNavigationBar } from "./AppNavigationBar";
import { UserProvider } from "./UserContext";
import {
  FormsList,
  FormEditor,
  CreateForm,
  MyFormInstances,
  FillForm,
} from "./forms/ui";
import "./App.css";
import "bootstrap/dist/css/bootstrap.css";
import "./sketchy-bs.css";

function App() {
  return (
    <UserProvider>
      <Container fluid>
        <HashRouter>
          <AppNavigationBar />
          <Routes>
            <Route path="/forms" element={<FormsList />} />
            <Route path="/forms/create" element={<CreateForm />} />
            <Route path="/forms/edit/:id" element={<FormEditor />} />
            <Route path="/fillform" element={<FillForm />} />
            <Route path="/myforms" element={<MyFormInstances />} />
            <Route path="/forms/fill/:id" element={<FillForm />} />
            <Route path="/forms/view/:id" element={<FillForm />} />
          </Routes>
        </HashRouter>
      </Container>
    </UserProvider>
  );
}

export default App;
