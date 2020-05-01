{
  "targets": [
    {
      "target_name": "neuralnetwork",
      "sources": [
        "neuralnetwork.cpp",
        "matlib.cpp",
        "neu.cpp"
      ],
      'include_dirs': ["<!@(node -p \"require('node-addon-api').include\")"],
      'dependencies': ["<!(node -p \"require('node-addon-api').gyp\")"]
    }
  ]
}