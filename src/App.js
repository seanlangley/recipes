/* src/App.js */
import React, { useEffect, useState } from "react";
import Amplify, { API, graphqlOperation } from "aws-amplify";
import { createRecipe } from "./graphql/mutations";
import { listRecipes } from "./graphql/queries";
import { withAuthenticator } from "@aws-amplify/ui-react";

import awsExports from "./aws-exports";
Amplify.configure(awsExports);

const initialState = { name: "", instructions: "" };

const App = () => {
  const [formState, setFormState] = useState(initialState);
  const [recipes, setRecipes] = useState([]);
  const [numInstrs, setNumInstrs] = useState(0);
  const [instrs, setInstrs] = useState([]);
  const [inputs, setInputs] = useState([]);

  useEffect(() => {
    fetchRecipes();
  }, []);

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value });
  }

  async function fetchRecipes() {
    try {
      const recipeData = await API.graphql(graphqlOperation(listRecipes));
      const recipes = recipeData.data.listRecipes.items;
      setRecipes(recipes);
    } catch (err) {
      console.log("error fetching recipes");
    }
  }

  async function addRecipe() {
    try {
      if (!formState.name || !formState.instructions) return;
      let recipe = { ...formState };
      recipe.instructions = recipe.instructions.split("\n");
      setRecipes([...recipes, recipe]);
      setFormState(initialState);
      await API.graphql(graphqlOperation(createRecipe, { input: recipe }));
    } catch (err) {
      console.log("error creating recipe:", err);
    }
  }

  function InstrInput(props){
    return (
        <input
          placeholder={"Step " + props.idx}
          value={instrs[props.idx]}
          onChange={(event) => {
            let instrs_copy = instrs;
            instrs_copy[props.idx] = event.target.value;
            setInstrs(instrs_copy);
            console.log(instrs);
          }}
        />
    );
  }

  return (
    <div style={styles.container}>
      <h2>Recipes</h2>
      <button
        onClick={() => {
          setInputs([...inputs,
            <InstrInput key={numInstrs} idx={numInstrs}/>
          ]);
          console.log(numInstrs)
          setNumInstrs(numInstrs + 1);
        }}
      >
        test
      </button>
      {inputs}
      <input
        onChange={(event) => setInput("name", event.target.value)}
        style={styles.input}
        value={formState.name}
        placeholder="Name"
      />
      <textarea
        onChange={(event) => setInput("instructions", event.target.value)}
        style={styles.input}
        value={formState.instructions}
        placeholder="Instructions"
      />
      <button style={styles.button} onClick={addRecipe}>
        Create recipe
      </button>
      {recipes.map((recipe, index) => (
        <div key={recipe.id ? recipe.id : index} style={styles.recipe}>
          <p style={styles.todoName}>{recipe.name}</p>
          {recipe.instructions ? (
            recipe.instructions.map((instruction, index) => (
              <p key={index} style={styles.todoDescription}>
                {instruction}
              </p>
            ))
          ) : (
            <p>No Instructions</p>
          )}
        </div>
      ))}
    </div>
  );
};

const styles = {
  container: {
    width: 400,
    margin: "0 auto",
    display: "flex",
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    padding: 20,
  },
  recipe: { marginBottom: 15 },
  input: {
    border: "none",
    backgroundColor: "#ddd",
    marginBottom: 10,
    padding: 8,
    fontSize: 18,
  },
  todoName: { fontSize: 20, fontWeight: "bold" },
  todoDescription: { marginBottom: 0 },
  button: {
    backgroundColor: "black",
    color: "white",
    outline: "none",
    fontSize: 18,
    padding: "12px 0px",
  },
};

export default withAuthenticator(App);
