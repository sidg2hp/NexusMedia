const Footer = () => {
  return (
    <footer className="bg-pastel-blue text-white p-5 shadow-md mt-12">
      <div className="container mx-auto text-center">
        <p>&copy; {new Date().getFullYear()} EventMedia. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
