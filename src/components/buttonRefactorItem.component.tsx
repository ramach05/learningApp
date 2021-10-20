import React, { useState } from "react";

type TProps = {
  initialTitle: string;
  initialBody: string;
};

export const ButtonRefactorItem = ({ initialTitle, initialBody }: TProps) => {
  const [inputRefactorState, setInputRefactorState] = useState({
    inputRefactorTitle: initialTitle,
    inputRefactorBody: initialBody,
  });

  const [visibilityRefactorForm, setVisibilityRefactorForm] = useState(false);

  const handleShowRefactorForm = () => {
    setVisibilityRefactorForm((prev) => !prev);
  };

  const handleChangeInput = (e: any) => {
    console.log("inputRefactorState :>> ", inputRefactorState);

    const { id, value } = e.target;

    if (id === "refactor-input-title") {
      return setInputRefactorState((prev) => ({
        ...prev,
        inputRefactorTitle: value,
      }));
    }
    if (id === "refactor-input-body") {
      return setInputRefactorState((prev) => ({
        ...prev,
        inputRefactorBody: value,
      }));
    }
  };

  return (
    <>
      <button type="button" onClick={handleShowRefactorForm}>
        Refactor
      </button>

      {visibilityRefactorForm && (
        <form onSubmit={() => {}}>
          <input
            id="refactor-input-title"
            type="text"
            autoComplete="off"
            placeholder="Change title item"
            onChange={handleChangeInput}
            value={inputRefactorState.inputRefactorTitle}
          />
          <input
            id="refactor-input-body"
            type="text"
            autoComplete="off"
            placeholder="Change body item"
            onChange={handleChangeInput}
            value={inputRefactorState.inputRefactorBody}
          />

          <button type="submit">ОК</button>
        </form>
      )}
    </>
  );
};
