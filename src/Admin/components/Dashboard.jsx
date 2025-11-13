import Header from './Header';
import Sidebar from './Sidebar';
import Content from './Content';

function Dashboard() {
  return (
    <div>
      <Header />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <div style={{ flex: 1, padding: '20px' }}>
          <Content />
        </div>
      </div>
    </div>
  );
}
export default Dashboard;
