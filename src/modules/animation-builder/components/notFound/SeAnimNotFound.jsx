const SeAnimNotFound = () => {
  return (
    <div>
      <div className="flex justify-center items-center">
        <img
          width={100}
          height={71}
          src="http://www.themecrowdy.com/wp-content/uploads/2025/10/no-searchresult-found.webp"
          alt="Animation not found"
        />
      </div>
      <h2 className="text-[12px] font-medium text-text text-center mt-[12px]">
        No Result Found
      </h2>
      <p className="text-[9px] text-text-3 text-center mt-[4px]">
        We couldn’t find anything matching your <br /> search try different
        keywords
      </p>
    </div>
  );
};

export default SeAnimNotFound;
