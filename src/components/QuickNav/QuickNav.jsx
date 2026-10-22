const QuickNav = ({ items }) => (
  <nav className="quick-nav" aria-label="페이지 바로가기">
    {items.map(({ id, label }) => (
      <a key={id} className="quick-nav-item" href={`#${id}`}>
        {label}
      </a>
    ))}
  </nav>
);

export default QuickNav;
