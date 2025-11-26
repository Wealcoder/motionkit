const STAnimNotFound = () => {
  return (
    <div>
      <div className="flex justify-center items-center">
        <img
          width={100}
          height={71}
          src="https://www.themecrowdy.com/wp-content/uploads/2025/10/no-animation-found.webp"
          alt="Animation not found"
        />
      </div>
      <h2 className="text-[12px] font-medium text-text text-center mt-[12px]">
        No Animation Found
      </h2>
      <p className="text-[9px] text-text-3 text-center mt-[4px]">
        This website does not use any animations or <br /> motion effects
      </p>
    </div>
  );
};

export default STAnimNotFound;
