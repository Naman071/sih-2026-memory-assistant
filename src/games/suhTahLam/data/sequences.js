/**
 * SUH TAH LAM - Deterministic Sequence Dataset
 * Curated 60+ sequences across Easy, Medium, and Hard.
 */

export const EASY_SEQUENCES = [
  {
    "id": "seq_easy_01",
    "tier": "easy",
    "name": "Rhythm Pattern 1",
    "eventCount": 3,
    "bambooTotalClaps": 1,
    "initialGridPosition": 5,
    "finalGridPosition": 6,
    "gridPath": [
      5,
      6,
      3
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "step_right",
        "dancerPosition": 6,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "step_right",
        "dancerPosition": 3,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "step_center",
        "dancerPosition": 6,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "dancer_position",
      "correctAnswer": "Dancer position",
      "options": [
        "Dancer position",
        "Bamboo position",
        "Performer stance",
        "Nothing changed"
      ],
      "description": "Observation variation 1"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "STEP RIGHT",
        "CLOSE"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_easy_02",
    "tier": "easy",
    "name": "Rhythm Pattern 2",
    "eventCount": 3,
    "bambooTotalClaps": 1,
    "initialGridPosition": 5,
    "finalGridPosition": 4,
    "gridPath": [
      5,
      4
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "step_left",
        "dancerPosition": 4,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "step_center",
        "dancerPosition": 5,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "step_left",
        "dancerPosition": 4,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "bamboo_position",
      "correctAnswer": "Bamboo position",
      "options": [
        "Bamboo position",
        "Dancer position",
        "Performer stance",
        "Nothing changed"
      ],
      "description": "Observation variation 2"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "STEP LEFT",
        "CLOSE"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_easy_03",
    "tier": "easy",
    "name": "Rhythm Pattern 3",
    "eventCount": 3,
    "bambooTotalClaps": 1,
    "initialGridPosition": 5,
    "finalGridPosition": 6,
    "gridPath": [
      5,
      6
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "step_right",
        "dancerPosition": 6,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "step_left",
        "dancerPosition": 5,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "step_right",
        "dancerPosition": 6,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "performer_stance",
      "correctAnswer": "Performer stance",
      "options": [
        "Performer stance",
        "Dancer position",
        "Bamboo position",
        "Nothing changed"
      ],
      "description": "Observation variation 3"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "STEP RIGHT",
        "CLOSE"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_easy_04",
    "tier": "easy",
    "name": "Rhythm Pattern 4",
    "eventCount": 3,
    "bambooTotalClaps": 1,
    "initialGridPosition": 5,
    "finalGridPosition": 4,
    "gridPath": [
      5,
      4
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "step_left",
        "dancerPosition": 4,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "step_right",
        "dancerPosition": 5,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "step_left",
        "dancerPosition": 4,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "none",
      "correctAnswer": "Nothing changed",
      "options": [
        "Nothing changed",
        "Dancer position",
        "Bamboo position",
        "Performer stance"
      ],
      "description": "Observation variation 4"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "STEP LEFT",
        "CLOSE"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_easy_05",
    "tier": "easy",
    "name": "Rhythm Pattern 5",
    "eventCount": 3,
    "bambooTotalClaps": 1,
    "initialGridPosition": 5,
    "finalGridPosition": 6,
    "gridPath": [
      5,
      6
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "step_right",
        "dancerPosition": 6,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "step_center",
        "dancerPosition": 5,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "step_right",
        "dancerPosition": 6,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "dancer_position",
      "correctAnswer": "Dancer position",
      "options": [
        "Dancer position",
        "Bamboo position",
        "Performer stance",
        "Nothing changed"
      ],
      "description": "Observation variation 5"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "STEP RIGHT",
        "CLOSE"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_easy_06",
    "tier": "easy",
    "name": "Rhythm Pattern 6",
    "eventCount": 3,
    "bambooTotalClaps": 1,
    "initialGridPosition": 5,
    "finalGridPosition": 4,
    "gridPath": [
      5,
      4,
      1
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "step_left",
        "dancerPosition": 4,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "step_left",
        "dancerPosition": 1,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "step_center",
        "dancerPosition": 4,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "bamboo_position",
      "correctAnswer": "Bamboo position",
      "options": [
        "Bamboo position",
        "Dancer position",
        "Performer stance",
        "Nothing changed"
      ],
      "description": "Observation variation 6"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "STEP LEFT",
        "CLOSE"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_easy_07",
    "tier": "easy",
    "name": "Rhythm Pattern 7",
    "eventCount": 3,
    "bambooTotalClaps": 1,
    "initialGridPosition": 5,
    "finalGridPosition": 6,
    "gridPath": [
      5,
      6,
      3
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "step_right",
        "dancerPosition": 6,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "step_right",
        "dancerPosition": 3,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "step_center",
        "dancerPosition": 6,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "performer_stance",
      "correctAnswer": "Performer stance",
      "options": [
        "Performer stance",
        "Dancer position",
        "Bamboo position",
        "Nothing changed"
      ],
      "description": "Observation variation 7"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "STEP RIGHT",
        "CLOSE"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_easy_08",
    "tier": "easy",
    "name": "Rhythm Pattern 8",
    "eventCount": 3,
    "bambooTotalClaps": 1,
    "initialGridPosition": 5,
    "finalGridPosition": 4,
    "gridPath": [
      5,
      4
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "step_left",
        "dancerPosition": 4,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "step_center",
        "dancerPosition": 5,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "step_left",
        "dancerPosition": 4,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "none",
      "correctAnswer": "Nothing changed",
      "options": [
        "Nothing changed",
        "Dancer position",
        "Bamboo position",
        "Performer stance"
      ],
      "description": "Observation variation 8"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "STEP LEFT",
        "CLOSE"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_easy_09",
    "tier": "easy",
    "name": "Rhythm Pattern 9",
    "eventCount": 3,
    "bambooTotalClaps": 1,
    "initialGridPosition": 5,
    "finalGridPosition": 6,
    "gridPath": [
      5,
      6
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "step_right",
        "dancerPosition": 6,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "step_left",
        "dancerPosition": 5,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "step_right",
        "dancerPosition": 6,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "dancer_position",
      "correctAnswer": "Dancer position",
      "options": [
        "Dancer position",
        "Bamboo position",
        "Performer stance",
        "Nothing changed"
      ],
      "description": "Observation variation 9"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "STEP RIGHT",
        "CLOSE"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_easy_10",
    "tier": "easy",
    "name": "Rhythm Pattern 10",
    "eventCount": 3,
    "bambooTotalClaps": 1,
    "initialGridPosition": 5,
    "finalGridPosition": 4,
    "gridPath": [
      5,
      4
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "step_left",
        "dancerPosition": 4,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "step_right",
        "dancerPosition": 5,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "step_left",
        "dancerPosition": 4,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "bamboo_position",
      "correctAnswer": "Bamboo position",
      "options": [
        "Bamboo position",
        "Dancer position",
        "Performer stance",
        "Nothing changed"
      ],
      "description": "Observation variation 10"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "STEP LEFT",
        "CLOSE"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_easy_11",
    "tier": "easy",
    "name": "Rhythm Pattern 11",
    "eventCount": 3,
    "bambooTotalClaps": 1,
    "initialGridPosition": 5,
    "finalGridPosition": 6,
    "gridPath": [
      5,
      6
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "step_right",
        "dancerPosition": 6,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "step_center",
        "dancerPosition": 5,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "step_right",
        "dancerPosition": 6,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "performer_stance",
      "correctAnswer": "Performer stance",
      "options": [
        "Performer stance",
        "Dancer position",
        "Bamboo position",
        "Nothing changed"
      ],
      "description": "Observation variation 11"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "STEP RIGHT",
        "CLOSE"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_easy_12",
    "tier": "easy",
    "name": "Rhythm Pattern 12",
    "eventCount": 3,
    "bambooTotalClaps": 1,
    "initialGridPosition": 5,
    "finalGridPosition": 4,
    "gridPath": [
      5,
      4,
      1
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "step_left",
        "dancerPosition": 4,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "step_left",
        "dancerPosition": 1,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "step_center",
        "dancerPosition": 4,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "none",
      "correctAnswer": "Nothing changed",
      "options": [
        "Nothing changed",
        "Dancer position",
        "Bamboo position",
        "Performer stance"
      ],
      "description": "Observation variation 12"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "STEP LEFT",
        "CLOSE"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_easy_13",
    "tier": "easy",
    "name": "Rhythm Pattern 13",
    "eventCount": 3,
    "bambooTotalClaps": 1,
    "initialGridPosition": 5,
    "finalGridPosition": 6,
    "gridPath": [
      5,
      6,
      3
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "step_right",
        "dancerPosition": 6,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "step_right",
        "dancerPosition": 3,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "step_center",
        "dancerPosition": 6,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "dancer_position",
      "correctAnswer": "Dancer position",
      "options": [
        "Dancer position",
        "Bamboo position",
        "Performer stance",
        "Nothing changed"
      ],
      "description": "Observation variation 13"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "STEP RIGHT",
        "CLOSE"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_easy_14",
    "tier": "easy",
    "name": "Rhythm Pattern 14",
    "eventCount": 3,
    "bambooTotalClaps": 1,
    "initialGridPosition": 5,
    "finalGridPosition": 4,
    "gridPath": [
      5,
      4
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "step_left",
        "dancerPosition": 4,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "step_center",
        "dancerPosition": 5,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "step_left",
        "dancerPosition": 4,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "bamboo_position",
      "correctAnswer": "Bamboo position",
      "options": [
        "Bamboo position",
        "Dancer position",
        "Performer stance",
        "Nothing changed"
      ],
      "description": "Observation variation 14"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "STEP LEFT",
        "CLOSE"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_easy_15",
    "tier": "easy",
    "name": "Rhythm Pattern 15",
    "eventCount": 3,
    "bambooTotalClaps": 1,
    "initialGridPosition": 5,
    "finalGridPosition": 6,
    "gridPath": [
      5,
      6
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "step_right",
        "dancerPosition": 6,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "step_left",
        "dancerPosition": 5,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "step_right",
        "dancerPosition": 6,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "performer_stance",
      "correctAnswer": "Performer stance",
      "options": [
        "Performer stance",
        "Dancer position",
        "Bamboo position",
        "Nothing changed"
      ],
      "description": "Observation variation 15"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "STEP RIGHT",
        "CLOSE"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_easy_16",
    "tier": "easy",
    "name": "Rhythm Pattern 16",
    "eventCount": 3,
    "bambooTotalClaps": 1,
    "initialGridPosition": 5,
    "finalGridPosition": 4,
    "gridPath": [
      5,
      4
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "step_left",
        "dancerPosition": 4,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "step_right",
        "dancerPosition": 5,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "step_left",
        "dancerPosition": 4,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "none",
      "correctAnswer": "Nothing changed",
      "options": [
        "Nothing changed",
        "Dancer position",
        "Bamboo position",
        "Performer stance"
      ],
      "description": "Observation variation 16"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "STEP LEFT",
        "CLOSE"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_easy_17",
    "tier": "easy",
    "name": "Rhythm Pattern 17",
    "eventCount": 3,
    "bambooTotalClaps": 1,
    "initialGridPosition": 5,
    "finalGridPosition": 6,
    "gridPath": [
      5,
      6
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "step_right",
        "dancerPosition": 6,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "step_center",
        "dancerPosition": 5,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "step_right",
        "dancerPosition": 6,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "dancer_position",
      "correctAnswer": "Dancer position",
      "options": [
        "Dancer position",
        "Bamboo position",
        "Performer stance",
        "Nothing changed"
      ],
      "description": "Observation variation 17"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "STEP RIGHT",
        "CLOSE"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_easy_18",
    "tier": "easy",
    "name": "Rhythm Pattern 18",
    "eventCount": 3,
    "bambooTotalClaps": 1,
    "initialGridPosition": 5,
    "finalGridPosition": 4,
    "gridPath": [
      5,
      4,
      1
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "step_left",
        "dancerPosition": 4,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "step_left",
        "dancerPosition": 1,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "step_center",
        "dancerPosition": 4,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "bamboo_position",
      "correctAnswer": "Bamboo position",
      "options": [
        "Bamboo position",
        "Dancer position",
        "Performer stance",
        "Nothing changed"
      ],
      "description": "Observation variation 18"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "STEP LEFT",
        "CLOSE"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_easy_19",
    "tier": "easy",
    "name": "Rhythm Pattern 19",
    "eventCount": 3,
    "bambooTotalClaps": 1,
    "initialGridPosition": 5,
    "finalGridPosition": 6,
    "gridPath": [
      5,
      6,
      3
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "step_right",
        "dancerPosition": 6,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "step_right",
        "dancerPosition": 3,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "step_center",
        "dancerPosition": 6,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "performer_stance",
      "correctAnswer": "Performer stance",
      "options": [
        "Performer stance",
        "Dancer position",
        "Bamboo position",
        "Nothing changed"
      ],
      "description": "Observation variation 19"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "STEP RIGHT",
        "CLOSE"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_easy_20",
    "tier": "easy",
    "name": "Rhythm Pattern 20",
    "eventCount": 3,
    "bambooTotalClaps": 1,
    "initialGridPosition": 5,
    "finalGridPosition": 4,
    "gridPath": [
      5,
      4
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "step_left",
        "dancerPosition": 4,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "step_center",
        "dancerPosition": 5,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "step_left",
        "dancerPosition": 4,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "none",
      "correctAnswer": "Nothing changed",
      "options": [
        "Nothing changed",
        "Dancer position",
        "Bamboo position",
        "Performer stance"
      ],
      "description": "Observation variation 20"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "STEP LEFT",
        "CLOSE"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  }
];

export const MEDIUM_SEQUENCES = [
  {
    "id": "seq_medium_01",
    "tier": "medium",
    "name": "Rhythm Pattern 1",
    "eventCount": 5,
    "bambooTotalClaps": 2,
    "initialGridPosition": 5,
    "finalGridPosition": 6,
    "gridPath": [
      5,
      6
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "step_right",
        "dancerPosition": 6,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "step_left",
        "dancerPosition": 5,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "step_right",
        "dancerPosition": 6,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 3,
        "bambooAction": "close",
        "dancerAction": "step_center",
        "dancerPosition": 5,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 4,
        "bambooAction": "open",
        "dancerAction": "step_right",
        "dancerPosition": 6,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "dancer_position",
      "correctAnswer": "Dancer position",
      "options": [
        "Dancer position",
        "Bamboo position",
        "Performer stance",
        "Nothing changed"
      ],
      "description": "Observation variation 1"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "STEP RIGHT",
        "CLOSE",
        "STEP LEFT"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_medium_02",
    "tier": "medium",
    "name": "Rhythm Pattern 2",
    "eventCount": 5,
    "bambooTotalClaps": 2,
    "initialGridPosition": 5,
    "finalGridPosition": 5,
    "gridPath": [
      5
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "turn",
        "dancerPosition": 5,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "turn",
        "dancerPosition": 5,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "turn",
        "dancerPosition": 5,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 3,
        "bambooAction": "close",
        "dancerAction": "turn",
        "dancerPosition": 5,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 4,
        "bambooAction": "open",
        "dancerAction": "turn",
        "dancerPosition": 5,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "bamboo_position",
      "correctAnswer": "Bamboo position",
      "options": [
        "Bamboo position",
        "Dancer position",
        "Performer stance",
        "Nothing changed"
      ],
      "description": "Observation variation 2"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "TURN",
        "CLOSE",
        "TURN"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_medium_03",
    "tier": "medium",
    "name": "Rhythm Pattern 3",
    "eventCount": 5,
    "bambooTotalClaps": 2,
    "initialGridPosition": 5,
    "finalGridPosition": 1,
    "gridPath": [
      5,
      4,
      1
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "step_left",
        "dancerPosition": 4,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "step_center",
        "dancerPosition": 5,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "step_left",
        "dancerPosition": 4,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 3,
        "bambooAction": "close",
        "dancerAction": "step_left",
        "dancerPosition": 1,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 4,
        "bambooAction": "open",
        "dancerAction": "turn",
        "dancerPosition": 1,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "performer_stance",
      "correctAnswer": "Performer stance",
      "options": [
        "Performer stance",
        "Dancer position",
        "Bamboo position",
        "Nothing changed"
      ],
      "description": "Observation variation 3"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "STEP LEFT",
        "CLOSE",
        "CENTER STEP"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_medium_04",
    "tier": "medium",
    "name": "Rhythm Pattern 4",
    "eventCount": 5,
    "bambooTotalClaps": 2,
    "initialGridPosition": 5,
    "finalGridPosition": 5,
    "gridPath": [
      5,
      6
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "step_right",
        "dancerPosition": 6,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "turn",
        "dancerPosition": 6,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "step_center",
        "dancerPosition": 5,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 3,
        "bambooAction": "close",
        "dancerAction": "step_right",
        "dancerPosition": 6,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 4,
        "bambooAction": "open",
        "dancerAction": "step_left",
        "dancerPosition": 5,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "none",
      "correctAnswer": "Nothing changed",
      "options": [
        "Nothing changed",
        "Dancer position",
        "Bamboo position",
        "Performer stance"
      ],
      "description": "Observation variation 4"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "STEP RIGHT",
        "CLOSE",
        "TURN"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_medium_05",
    "tier": "medium",
    "name": "Rhythm Pattern 5",
    "eventCount": 5,
    "bambooTotalClaps": 2,
    "initialGridPosition": 5,
    "finalGridPosition": 5,
    "gridPath": [
      5
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "turn",
        "dancerPosition": 5,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "turn",
        "dancerPosition": 5,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "turn",
        "dancerPosition": 5,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 3,
        "bambooAction": "close",
        "dancerAction": "turn",
        "dancerPosition": 5,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 4,
        "bambooAction": "open",
        "dancerAction": "turn",
        "dancerPosition": 5,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "dancer_position",
      "correctAnswer": "Dancer position",
      "options": [
        "Dancer position",
        "Bamboo position",
        "Performer stance",
        "Nothing changed"
      ],
      "description": "Observation variation 5"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "TURN",
        "CLOSE",
        "TURN"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_medium_06",
    "tier": "medium",
    "name": "Rhythm Pattern 6",
    "eventCount": 5,
    "bambooTotalClaps": 2,
    "initialGridPosition": 5,
    "finalGridPosition": 5,
    "gridPath": [
      5,
      4
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "step_left",
        "dancerPosition": 4,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "step_right",
        "dancerPosition": 5,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "step_left",
        "dancerPosition": 4,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 3,
        "bambooAction": "close",
        "dancerAction": "turn",
        "dancerPosition": 4,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 4,
        "bambooAction": "open",
        "dancerAction": "step_center",
        "dancerPosition": 5,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "bamboo_position",
      "correctAnswer": "Bamboo position",
      "options": [
        "Bamboo position",
        "Dancer position",
        "Performer stance",
        "Nothing changed"
      ],
      "description": "Observation variation 6"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "STEP LEFT",
        "CLOSE",
        "STEP RIGHT"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_medium_07",
    "tier": "medium",
    "name": "Rhythm Pattern 7",
    "eventCount": 5,
    "bambooTotalClaps": 2,
    "initialGridPosition": 5,
    "finalGridPosition": 6,
    "gridPath": [
      5,
      6
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "step_right",
        "dancerPosition": 6,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "step_center",
        "dancerPosition": 5,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "step_right",
        "dancerPosition": 6,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 3,
        "bambooAction": "close",
        "dancerAction": "step_left",
        "dancerPosition": 5,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 4,
        "bambooAction": "open",
        "dancerAction": "step_right",
        "dancerPosition": 6,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "performer_stance",
      "correctAnswer": "Performer stance",
      "options": [
        "Performer stance",
        "Dancer position",
        "Bamboo position",
        "Nothing changed"
      ],
      "description": "Observation variation 7"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "STEP RIGHT",
        "CLOSE",
        "CENTER STEP"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_medium_08",
    "tier": "medium",
    "name": "Rhythm Pattern 8",
    "eventCount": 5,
    "bambooTotalClaps": 2,
    "initialGridPosition": 5,
    "finalGridPosition": 5,
    "gridPath": [
      5
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "turn",
        "dancerPosition": 5,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "turn",
        "dancerPosition": 5,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "turn",
        "dancerPosition": 5,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 3,
        "bambooAction": "close",
        "dancerAction": "turn",
        "dancerPosition": 5,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 4,
        "bambooAction": "open",
        "dancerAction": "turn",
        "dancerPosition": 5,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "none",
      "correctAnswer": "Nothing changed",
      "options": [
        "Nothing changed",
        "Dancer position",
        "Bamboo position",
        "Performer stance"
      ],
      "description": "Observation variation 8"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "TURN",
        "CLOSE",
        "TURN"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_medium_09",
    "tier": "medium",
    "name": "Rhythm Pattern 9",
    "eventCount": 5,
    "bambooTotalClaps": 2,
    "initialGridPosition": 5,
    "finalGridPosition": 5,
    "gridPath": [
      5,
      4,
      1
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "step_left",
        "dancerPosition": 4,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "step_left",
        "dancerPosition": 1,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "turn",
        "dancerPosition": 1,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 3,
        "bambooAction": "close",
        "dancerAction": "step_center",
        "dancerPosition": 4,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 4,
        "bambooAction": "open",
        "dancerAction": "step_right",
        "dancerPosition": 5,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "dancer_position",
      "correctAnswer": "Dancer position",
      "options": [
        "Dancer position",
        "Bamboo position",
        "Performer stance",
        "Nothing changed"
      ],
      "description": "Observation variation 9"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "STEP LEFT",
        "CLOSE",
        "STEP LEFT"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_medium_10",
    "tier": "medium",
    "name": "Rhythm Pattern 10",
    "eventCount": 5,
    "bambooTotalClaps": 2,
    "initialGridPosition": 5,
    "finalGridPosition": 5,
    "gridPath": [
      5,
      6,
      3
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "step_right",
        "dancerPosition": 6,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "step_right",
        "dancerPosition": 3,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "step_center",
        "dancerPosition": 6,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 3,
        "bambooAction": "close",
        "dancerAction": "turn",
        "dancerPosition": 6,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 4,
        "bambooAction": "open",
        "dancerAction": "step_center",
        "dancerPosition": 5,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "bamboo_position",
      "correctAnswer": "Bamboo position",
      "options": [
        "Bamboo position",
        "Dancer position",
        "Performer stance",
        "Nothing changed"
      ],
      "description": "Observation variation 10"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "STEP RIGHT",
        "CLOSE",
        "STEP RIGHT"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_medium_11",
    "tier": "medium",
    "name": "Rhythm Pattern 11",
    "eventCount": 5,
    "bambooTotalClaps": 2,
    "initialGridPosition": 5,
    "finalGridPosition": 5,
    "gridPath": [
      5
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "turn",
        "dancerPosition": 5,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "turn",
        "dancerPosition": 5,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "turn",
        "dancerPosition": 5,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 3,
        "bambooAction": "close",
        "dancerAction": "turn",
        "dancerPosition": 5,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 4,
        "bambooAction": "open",
        "dancerAction": "turn",
        "dancerPosition": 5,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "performer_stance",
      "correctAnswer": "Performer stance",
      "options": [
        "Performer stance",
        "Dancer position",
        "Bamboo position",
        "Nothing changed"
      ],
      "description": "Observation variation 11"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "TURN",
        "CLOSE",
        "TURN"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_medium_12",
    "tier": "medium",
    "name": "Rhythm Pattern 12",
    "eventCount": 5,
    "bambooTotalClaps": 2,
    "initialGridPosition": 5,
    "finalGridPosition": 1,
    "gridPath": [
      5,
      4,
      1
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "step_left",
        "dancerPosition": 4,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "turn",
        "dancerPosition": 4,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "step_center",
        "dancerPosition": 5,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 3,
        "bambooAction": "close",
        "dancerAction": "step_left",
        "dancerPosition": 4,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 4,
        "bambooAction": "open",
        "dancerAction": "step_left",
        "dancerPosition": 1,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "none",
      "correctAnswer": "Nothing changed",
      "options": [
        "Nothing changed",
        "Dancer position",
        "Bamboo position",
        "Performer stance"
      ],
      "description": "Observation variation 12"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "STEP LEFT",
        "CLOSE",
        "TURN"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_medium_13",
    "tier": "medium",
    "name": "Rhythm Pattern 13",
    "eventCount": 5,
    "bambooTotalClaps": 2,
    "initialGridPosition": 5,
    "finalGridPosition": 6,
    "gridPath": [
      5,
      6
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "step_right",
        "dancerPosition": 6,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "step_left",
        "dancerPosition": 5,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "step_right",
        "dancerPosition": 6,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 3,
        "bambooAction": "close",
        "dancerAction": "step_center",
        "dancerPosition": 5,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 4,
        "bambooAction": "open",
        "dancerAction": "step_right",
        "dancerPosition": 6,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "dancer_position",
      "correctAnswer": "Dancer position",
      "options": [
        "Dancer position",
        "Bamboo position",
        "Performer stance",
        "Nothing changed"
      ],
      "description": "Observation variation 13"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "STEP RIGHT",
        "CLOSE",
        "STEP LEFT"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_medium_14",
    "tier": "medium",
    "name": "Rhythm Pattern 14",
    "eventCount": 5,
    "bambooTotalClaps": 2,
    "initialGridPosition": 5,
    "finalGridPosition": 5,
    "gridPath": [
      5
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "turn",
        "dancerPosition": 5,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "turn",
        "dancerPosition": 5,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "turn",
        "dancerPosition": 5,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 3,
        "bambooAction": "close",
        "dancerAction": "turn",
        "dancerPosition": 5,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 4,
        "bambooAction": "open",
        "dancerAction": "turn",
        "dancerPosition": 5,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "bamboo_position",
      "correctAnswer": "Bamboo position",
      "options": [
        "Bamboo position",
        "Dancer position",
        "Performer stance",
        "Nothing changed"
      ],
      "description": "Observation variation 14"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "TURN",
        "CLOSE",
        "TURN"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_medium_15",
    "tier": "medium",
    "name": "Rhythm Pattern 15",
    "eventCount": 5,
    "bambooTotalClaps": 2,
    "initialGridPosition": 5,
    "finalGridPosition": 1,
    "gridPath": [
      5,
      4,
      1
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "step_left",
        "dancerPosition": 4,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "step_center",
        "dancerPosition": 5,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "step_left",
        "dancerPosition": 4,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 3,
        "bambooAction": "close",
        "dancerAction": "step_left",
        "dancerPosition": 1,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 4,
        "bambooAction": "open",
        "dancerAction": "turn",
        "dancerPosition": 1,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "performer_stance",
      "correctAnswer": "Performer stance",
      "options": [
        "Performer stance",
        "Dancer position",
        "Bamboo position",
        "Nothing changed"
      ],
      "description": "Observation variation 15"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "STEP LEFT",
        "CLOSE",
        "CENTER STEP"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_medium_16",
    "tier": "medium",
    "name": "Rhythm Pattern 16",
    "eventCount": 5,
    "bambooTotalClaps": 2,
    "initialGridPosition": 5,
    "finalGridPosition": 5,
    "gridPath": [
      5,
      6
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "step_right",
        "dancerPosition": 6,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "turn",
        "dancerPosition": 6,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "step_center",
        "dancerPosition": 5,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 3,
        "bambooAction": "close",
        "dancerAction": "step_right",
        "dancerPosition": 6,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 4,
        "bambooAction": "open",
        "dancerAction": "step_left",
        "dancerPosition": 5,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "none",
      "correctAnswer": "Nothing changed",
      "options": [
        "Nothing changed",
        "Dancer position",
        "Bamboo position",
        "Performer stance"
      ],
      "description": "Observation variation 16"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "STEP RIGHT",
        "CLOSE",
        "TURN"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_medium_17",
    "tier": "medium",
    "name": "Rhythm Pattern 17",
    "eventCount": 5,
    "bambooTotalClaps": 2,
    "initialGridPosition": 5,
    "finalGridPosition": 5,
    "gridPath": [
      5
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "turn",
        "dancerPosition": 5,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "turn",
        "dancerPosition": 5,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "turn",
        "dancerPosition": 5,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 3,
        "bambooAction": "close",
        "dancerAction": "turn",
        "dancerPosition": 5,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 4,
        "bambooAction": "open",
        "dancerAction": "turn",
        "dancerPosition": 5,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "dancer_position",
      "correctAnswer": "Dancer position",
      "options": [
        "Dancer position",
        "Bamboo position",
        "Performer stance",
        "Nothing changed"
      ],
      "description": "Observation variation 17"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "TURN",
        "CLOSE",
        "TURN"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_medium_18",
    "tier": "medium",
    "name": "Rhythm Pattern 18",
    "eventCount": 5,
    "bambooTotalClaps": 2,
    "initialGridPosition": 5,
    "finalGridPosition": 5,
    "gridPath": [
      5,
      4
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "step_left",
        "dancerPosition": 4,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "step_right",
        "dancerPosition": 5,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "step_left",
        "dancerPosition": 4,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 3,
        "bambooAction": "close",
        "dancerAction": "turn",
        "dancerPosition": 4,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 4,
        "bambooAction": "open",
        "dancerAction": "step_center",
        "dancerPosition": 5,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "bamboo_position",
      "correctAnswer": "Bamboo position",
      "options": [
        "Bamboo position",
        "Dancer position",
        "Performer stance",
        "Nothing changed"
      ],
      "description": "Observation variation 18"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "STEP LEFT",
        "CLOSE",
        "STEP RIGHT"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_medium_19",
    "tier": "medium",
    "name": "Rhythm Pattern 19",
    "eventCount": 5,
    "bambooTotalClaps": 2,
    "initialGridPosition": 5,
    "finalGridPosition": 6,
    "gridPath": [
      5,
      6
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "step_right",
        "dancerPosition": 6,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "step_center",
        "dancerPosition": 5,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "step_right",
        "dancerPosition": 6,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 3,
        "bambooAction": "close",
        "dancerAction": "step_left",
        "dancerPosition": 5,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 4,
        "bambooAction": "open",
        "dancerAction": "step_right",
        "dancerPosition": 6,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "performer_stance",
      "correctAnswer": "Performer stance",
      "options": [
        "Performer stance",
        "Dancer position",
        "Bamboo position",
        "Nothing changed"
      ],
      "description": "Observation variation 19"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "STEP RIGHT",
        "CLOSE",
        "CENTER STEP"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_medium_20",
    "tier": "medium",
    "name": "Rhythm Pattern 20",
    "eventCount": 5,
    "bambooTotalClaps": 2,
    "initialGridPosition": 5,
    "finalGridPosition": 5,
    "gridPath": [
      5
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "turn",
        "dancerPosition": 5,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "turn",
        "dancerPosition": 5,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "turn",
        "dancerPosition": 5,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 3,
        "bambooAction": "close",
        "dancerAction": "turn",
        "dancerPosition": 5,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 4,
        "bambooAction": "open",
        "dancerAction": "turn",
        "dancerPosition": 5,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "none",
      "correctAnswer": "Nothing changed",
      "options": [
        "Nothing changed",
        "Dancer position",
        "Bamboo position",
        "Performer stance"
      ],
      "description": "Observation variation 20"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "TURN",
        "CLOSE",
        "TURN"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  }
];

export const HARD_SEQUENCES = [
  {
    "id": "seq_hard_01",
    "tier": "hard",
    "name": "Rhythm Pattern 1",
    "eventCount": 7,
    "bambooTotalClaps": 3,
    "initialGridPosition": 5,
    "finalGridPosition": 3,
    "gridPath": [
      5,
      6,
      3
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "step_right",
        "dancerPosition": 6,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "step_forward",
        "dancerPosition": 3,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "turn",
        "dancerPosition": 3,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 3,
        "bambooAction": "close",
        "dancerAction": "turn",
        "dancerPosition": 3,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 4,
        "bambooAction": "open",
        "dancerAction": "turn",
        "dancerPosition": 3,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 5,
        "bambooAction": "close",
        "dancerAction": "turn",
        "dancerPosition": 3,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 6,
        "bambooAction": "open",
        "dancerAction": "turn",
        "dancerPosition": 3,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "dancer_position",
      "correctAnswer": "Dancer position",
      "options": [
        "Dancer position",
        "Bamboo position",
        "Performer stance",
        "Nothing changed"
      ],
      "description": "Observation variation 1"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "STEP RIGHT",
        "CLOSE",
        "STEP FORWARD",
        "OPEN"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_hard_02",
    "tier": "hard",
    "name": "Rhythm Pattern 2",
    "eventCount": 7,
    "bambooTotalClaps": 3,
    "initialGridPosition": 5,
    "finalGridPosition": 4,
    "gridPath": [
      5,
      4,
      6
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "turn",
        "dancerPosition": 5,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "step_left",
        "dancerPosition": 4,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "step_center",
        "dancerPosition": 5,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 3,
        "bambooAction": "close",
        "dancerAction": "step_right",
        "dancerPosition": 6,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 4,
        "bambooAction": "open",
        "dancerAction": "step_center",
        "dancerPosition": 5,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 5,
        "bambooAction": "close",
        "dancerAction": "turn",
        "dancerPosition": 5,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 6,
        "bambooAction": "open",
        "dancerAction": "step_left",
        "dancerPosition": 4,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "bamboo_position",
      "correctAnswer": "Bamboo position",
      "options": [
        "Bamboo position",
        "Dancer position",
        "Performer stance",
        "Nothing changed"
      ],
      "description": "Observation variation 2"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "TURN",
        "CLOSE",
        "STEP LEFT",
        "OPEN"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_hard_03",
    "tier": "hard",
    "name": "Rhythm Pattern 3",
    "eventCount": 7,
    "bambooTotalClaps": 3,
    "initialGridPosition": 5,
    "finalGridPosition": 4,
    "gridPath": [
      5,
      2,
      3,
      6,
      4,
      1
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "step_forward",
        "dancerPosition": 2,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "step_right",
        "dancerPosition": 3,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "step_center",
        "dancerPosition": 6,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 3,
        "bambooAction": "close",
        "dancerAction": "step_left",
        "dancerPosition": 5,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 4,
        "bambooAction": "open",
        "dancerAction": "step_left",
        "dancerPosition": 4,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 5,
        "bambooAction": "close",
        "dancerAction": "step_left",
        "dancerPosition": 1,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 6,
        "bambooAction": "open",
        "dancerAction": "step_center",
        "dancerPosition": 4,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "performer_stance",
      "correctAnswer": "Performer stance",
      "options": [
        "Performer stance",
        "Dancer position",
        "Bamboo position",
        "Nothing changed"
      ],
      "description": "Observation variation 3"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "STEP FORWARD",
        "CLOSE",
        "STEP RIGHT",
        "OPEN"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_hard_04",
    "tier": "hard",
    "name": "Rhythm Pattern 4",
    "eventCount": 7,
    "bambooTotalClaps": 3,
    "initialGridPosition": 5,
    "finalGridPosition": 3,
    "gridPath": [
      5,
      8,
      4,
      6,
      3
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "step_backward",
        "dancerPosition": 8,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "step_center",
        "dancerPosition": 5,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "step_left",
        "dancerPosition": 4,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 3,
        "bambooAction": "close",
        "dancerAction": "step_right",
        "dancerPosition": 5,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 4,
        "bambooAction": "open",
        "dancerAction": "step_right",
        "dancerPosition": 6,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 5,
        "bambooAction": "close",
        "dancerAction": "step_right",
        "dancerPosition": 3,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 6,
        "bambooAction": "open",
        "dancerAction": "turn",
        "dancerPosition": 3,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "none",
      "correctAnswer": "Nothing changed",
      "options": [
        "Nothing changed",
        "Dancer position",
        "Bamboo position",
        "Performer stance"
      ],
      "description": "Observation variation 4"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "STEP BACKWARD",
        "CLOSE",
        "CENTER STEP",
        "OPEN"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_hard_05",
    "tier": "hard",
    "name": "Rhythm Pattern 5",
    "eventCount": 7,
    "bambooTotalClaps": 3,
    "initialGridPosition": 5,
    "finalGridPosition": 7,
    "gridPath": [
      5,
      4,
      6,
      7
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "step_left",
        "dancerPosition": 4,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "step_center",
        "dancerPosition": 5,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "step_right",
        "dancerPosition": 6,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 3,
        "bambooAction": "close",
        "dancerAction": "step_center",
        "dancerPosition": 5,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 4,
        "bambooAction": "open",
        "dancerAction": "turn",
        "dancerPosition": 5,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 5,
        "bambooAction": "close",
        "dancerAction": "step_left",
        "dancerPosition": 4,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 6,
        "bambooAction": "open",
        "dancerAction": "step_backward",
        "dancerPosition": 7,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "dancer_position",
      "correctAnswer": "Dancer position",
      "options": [
        "Dancer position",
        "Bamboo position",
        "Performer stance",
        "Nothing changed"
      ],
      "description": "Observation variation 5"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "STEP LEFT",
        "CLOSE",
        "CENTER STEP",
        "OPEN"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_hard_06",
    "tier": "hard",
    "name": "Rhythm Pattern 6",
    "eventCount": 7,
    "bambooTotalClaps": 3,
    "initialGridPosition": 5,
    "finalGridPosition": 1,
    "gridPath": [
      5,
      6,
      4,
      1
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "step_right",
        "dancerPosition": 6,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "turn",
        "dancerPosition": 6,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "step_left",
        "dancerPosition": 5,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 3,
        "bambooAction": "close",
        "dancerAction": "step_left",
        "dancerPosition": 4,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 4,
        "bambooAction": "open",
        "dancerAction": "step_left",
        "dancerPosition": 1,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 5,
        "bambooAction": "close",
        "dancerAction": "step_center",
        "dancerPosition": 4,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 6,
        "bambooAction": "open",
        "dancerAction": "step_left",
        "dancerPosition": 1,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "bamboo_position",
      "correctAnswer": "Bamboo position",
      "options": [
        "Bamboo position",
        "Dancer position",
        "Performer stance",
        "Nothing changed"
      ],
      "description": "Observation variation 6"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "STEP RIGHT",
        "CLOSE",
        "TURN",
        "OPEN"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_hard_07",
    "tier": "hard",
    "name": "Rhythm Pattern 7",
    "eventCount": 7,
    "bambooTotalClaps": 3,
    "initialGridPosition": 5,
    "finalGridPosition": 3,
    "gridPath": [
      5,
      4,
      6,
      3
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "turn",
        "dancerPosition": 5,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "step_left",
        "dancerPosition": 4,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "step_right",
        "dancerPosition": 5,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 3,
        "bambooAction": "close",
        "dancerAction": "step_right",
        "dancerPosition": 6,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 4,
        "bambooAction": "open",
        "dancerAction": "step_right",
        "dancerPosition": 3,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 5,
        "bambooAction": "close",
        "dancerAction": "turn",
        "dancerPosition": 3,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 6,
        "bambooAction": "open",
        "dancerAction": "turn",
        "dancerPosition": 3,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "performer_stance",
      "correctAnswer": "Performer stance",
      "options": [
        "Performer stance",
        "Dancer position",
        "Bamboo position",
        "Nothing changed"
      ],
      "description": "Observation variation 7"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "TURN",
        "CLOSE",
        "STEP LEFT",
        "OPEN"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_hard_08",
    "tier": "hard",
    "name": "Rhythm Pattern 8",
    "eventCount": 7,
    "bambooTotalClaps": 3,
    "initialGridPosition": 5,
    "finalGridPosition": 5,
    "gridPath": [
      5,
      2,
      3,
      6,
      9
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "step_forward",
        "dancerPosition": 2,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "step_right",
        "dancerPosition": 3,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "step_backward",
        "dancerPosition": 6,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 3,
        "bambooAction": "close",
        "dancerAction": "step_backward",
        "dancerPosition": 9,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 4,
        "bambooAction": "open",
        "dancerAction": "turn",
        "dancerPosition": 9,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 5,
        "bambooAction": "close",
        "dancerAction": "step_forward",
        "dancerPosition": 6,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 6,
        "bambooAction": "open",
        "dancerAction": "step_center",
        "dancerPosition": 5,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "none",
      "correctAnswer": "Nothing changed",
      "options": [
        "Nothing changed",
        "Dancer position",
        "Bamboo position",
        "Performer stance"
      ],
      "description": "Observation variation 8"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "STEP FORWARD",
        "CLOSE",
        "STEP RIGHT",
        "OPEN"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_hard_09",
    "tier": "hard",
    "name": "Rhythm Pattern 9",
    "eventCount": 7,
    "bambooTotalClaps": 3,
    "initialGridPosition": 5,
    "finalGridPosition": 4,
    "gridPath": [
      5,
      8,
      4,
      1
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "step_backward",
        "dancerPosition": 8,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "step_center",
        "dancerPosition": 5,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "step_left",
        "dancerPosition": 4,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 3,
        "bambooAction": "close",
        "dancerAction": "step_left",
        "dancerPosition": 1,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 4,
        "bambooAction": "open",
        "dancerAction": "step_center",
        "dancerPosition": 4,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 5,
        "bambooAction": "close",
        "dancerAction": "step_left",
        "dancerPosition": 1,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 6,
        "bambooAction": "open",
        "dancerAction": "step_center",
        "dancerPosition": 4,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "dancer_position",
      "correctAnswer": "Dancer position",
      "options": [
        "Dancer position",
        "Bamboo position",
        "Performer stance",
        "Nothing changed"
      ],
      "description": "Observation variation 9"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "STEP BACKWARD",
        "CLOSE",
        "CENTER STEP",
        "OPEN"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_hard_10",
    "tier": "hard",
    "name": "Rhythm Pattern 10",
    "eventCount": 7,
    "bambooTotalClaps": 3,
    "initialGridPosition": 5,
    "finalGridPosition": 3,
    "gridPath": [
      5,
      4,
      6,
      3
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "step_left",
        "dancerPosition": 4,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "step_right",
        "dancerPosition": 5,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "step_right",
        "dancerPosition": 6,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 3,
        "bambooAction": "close",
        "dancerAction": "step_right",
        "dancerPosition": 3,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 4,
        "bambooAction": "open",
        "dancerAction": "turn",
        "dancerPosition": 3,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 5,
        "bambooAction": "close",
        "dancerAction": "turn",
        "dancerPosition": 3,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 6,
        "bambooAction": "open",
        "dancerAction": "turn",
        "dancerPosition": 3,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "bamboo_position",
      "correctAnswer": "Bamboo position",
      "options": [
        "Bamboo position",
        "Dancer position",
        "Performer stance",
        "Nothing changed"
      ],
      "description": "Observation variation 10"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "STEP LEFT",
        "CLOSE",
        "STEP RIGHT",
        "OPEN"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_hard_11",
    "tier": "hard",
    "name": "Rhythm Pattern 11",
    "eventCount": 7,
    "bambooTotalClaps": 3,
    "initialGridPosition": 5,
    "finalGridPosition": 4,
    "gridPath": [
      5,
      6,
      4,
      7
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "step_right",
        "dancerPosition": 6,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "step_center",
        "dancerPosition": 5,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "turn",
        "dancerPosition": 5,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 3,
        "bambooAction": "close",
        "dancerAction": "step_left",
        "dancerPosition": 4,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 4,
        "bambooAction": "open",
        "dancerAction": "step_backward",
        "dancerPosition": 7,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 5,
        "bambooAction": "close",
        "dancerAction": "turn",
        "dancerPosition": 7,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 6,
        "bambooAction": "open",
        "dancerAction": "step_forward",
        "dancerPosition": 4,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "performer_stance",
      "correctAnswer": "Performer stance",
      "options": [
        "Performer stance",
        "Dancer position",
        "Bamboo position",
        "Nothing changed"
      ],
      "description": "Observation variation 11"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "STEP RIGHT",
        "CLOSE",
        "CENTER STEP",
        "OPEN"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_hard_12",
    "tier": "hard",
    "name": "Rhythm Pattern 12",
    "eventCount": 7,
    "bambooTotalClaps": 3,
    "initialGridPosition": 5,
    "finalGridPosition": 1,
    "gridPath": [
      5,
      4,
      1
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "turn",
        "dancerPosition": 5,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "step_left",
        "dancerPosition": 4,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "step_left",
        "dancerPosition": 1,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 3,
        "bambooAction": "close",
        "dancerAction": "step_center",
        "dancerPosition": 4,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 4,
        "bambooAction": "open",
        "dancerAction": "step_left",
        "dancerPosition": 1,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 5,
        "bambooAction": "close",
        "dancerAction": "step_center",
        "dancerPosition": 4,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 6,
        "bambooAction": "open",
        "dancerAction": "step_left",
        "dancerPosition": 1,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "none",
      "correctAnswer": "Nothing changed",
      "options": [
        "Nothing changed",
        "Dancer position",
        "Bamboo position",
        "Performer stance"
      ],
      "description": "Observation variation 12"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "TURN",
        "CLOSE",
        "STEP LEFT",
        "OPEN"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_hard_13",
    "tier": "hard",
    "name": "Rhythm Pattern 13",
    "eventCount": 7,
    "bambooTotalClaps": 3,
    "initialGridPosition": 5,
    "finalGridPosition": 3,
    "gridPath": [
      5,
      2,
      3
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "step_forward",
        "dancerPosition": 2,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "step_right",
        "dancerPosition": 3,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "turn",
        "dancerPosition": 3,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 3,
        "bambooAction": "close",
        "dancerAction": "turn",
        "dancerPosition": 3,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 4,
        "bambooAction": "open",
        "dancerAction": "turn",
        "dancerPosition": 3,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 5,
        "bambooAction": "close",
        "dancerAction": "turn",
        "dancerPosition": 3,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 6,
        "bambooAction": "open",
        "dancerAction": "turn",
        "dancerPosition": 3,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "dancer_position",
      "correctAnswer": "Dancer position",
      "options": [
        "Dancer position",
        "Bamboo position",
        "Performer stance",
        "Nothing changed"
      ],
      "description": "Observation variation 13"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "STEP FORWARD",
        "CLOSE",
        "STEP RIGHT",
        "OPEN"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_hard_14",
    "tier": "hard",
    "name": "Rhythm Pattern 14",
    "eventCount": 7,
    "bambooTotalClaps": 3,
    "initialGridPosition": 5,
    "finalGridPosition": 5,
    "gridPath": [
      5,
      8,
      4,
      7
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "step_backward",
        "dancerPosition": 8,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "step_center",
        "dancerPosition": 5,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "step_left",
        "dancerPosition": 4,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 3,
        "bambooAction": "close",
        "dancerAction": "step_backward",
        "dancerPosition": 7,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 4,
        "bambooAction": "open",
        "dancerAction": "turn",
        "dancerPosition": 7,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 5,
        "bambooAction": "close",
        "dancerAction": "step_forward",
        "dancerPosition": 4,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 6,
        "bambooAction": "open",
        "dancerAction": "step_center",
        "dancerPosition": 5,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "bamboo_position",
      "correctAnswer": "Bamboo position",
      "options": [
        "Bamboo position",
        "Dancer position",
        "Performer stance",
        "Nothing changed"
      ],
      "description": "Observation variation 14"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "STEP BACKWARD",
        "CLOSE",
        "CENTER STEP",
        "OPEN"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_hard_15",
    "tier": "hard",
    "name": "Rhythm Pattern 15",
    "eventCount": 7,
    "bambooTotalClaps": 3,
    "initialGridPosition": 5,
    "finalGridPosition": 4,
    "gridPath": [
      5,
      4,
      1
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "step_left",
        "dancerPosition": 4,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "step_left",
        "dancerPosition": 1,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "step_center",
        "dancerPosition": 4,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 3,
        "bambooAction": "close",
        "dancerAction": "step_left",
        "dancerPosition": 1,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 4,
        "bambooAction": "open",
        "dancerAction": "step_center",
        "dancerPosition": 4,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 5,
        "bambooAction": "close",
        "dancerAction": "step_left",
        "dancerPosition": 1,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 6,
        "bambooAction": "open",
        "dancerAction": "step_center",
        "dancerPosition": 4,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "performer_stance",
      "correctAnswer": "Performer stance",
      "options": [
        "Performer stance",
        "Dancer position",
        "Bamboo position",
        "Nothing changed"
      ],
      "description": "Observation variation 15"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "STEP LEFT",
        "CLOSE",
        "STEP LEFT",
        "OPEN"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_hard_16",
    "tier": "hard",
    "name": "Rhythm Pattern 16",
    "eventCount": 7,
    "bambooTotalClaps": 3,
    "initialGridPosition": 5,
    "finalGridPosition": 3,
    "gridPath": [
      5,
      6,
      3
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "step_right",
        "dancerPosition": 6,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "step_right",
        "dancerPosition": 3,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "turn",
        "dancerPosition": 3,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 3,
        "bambooAction": "close",
        "dancerAction": "turn",
        "dancerPosition": 3,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 4,
        "bambooAction": "open",
        "dancerAction": "turn",
        "dancerPosition": 3,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 5,
        "bambooAction": "close",
        "dancerAction": "turn",
        "dancerPosition": 3,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 6,
        "bambooAction": "open",
        "dancerAction": "turn",
        "dancerPosition": 3,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "none",
      "correctAnswer": "Nothing changed",
      "options": [
        "Nothing changed",
        "Dancer position",
        "Bamboo position",
        "Performer stance"
      ],
      "description": "Observation variation 16"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "STEP RIGHT",
        "CLOSE",
        "STEP RIGHT",
        "OPEN"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_hard_17",
    "tier": "hard",
    "name": "Rhythm Pattern 17",
    "eventCount": 7,
    "bambooTotalClaps": 3,
    "initialGridPosition": 5,
    "finalGridPosition": 4,
    "gridPath": [
      5,
      4,
      7
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "turn",
        "dancerPosition": 5,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "step_left",
        "dancerPosition": 4,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "step_backward",
        "dancerPosition": 7,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 3,
        "bambooAction": "close",
        "dancerAction": "turn",
        "dancerPosition": 7,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 4,
        "bambooAction": "open",
        "dancerAction": "step_forward",
        "dancerPosition": 4,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 5,
        "bambooAction": "close",
        "dancerAction": "step_center",
        "dancerPosition": 5,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 6,
        "bambooAction": "open",
        "dancerAction": "step_left",
        "dancerPosition": 4,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "dancer_position",
      "correctAnswer": "Dancer position",
      "options": [
        "Dancer position",
        "Bamboo position",
        "Performer stance",
        "Nothing changed"
      ],
      "description": "Observation variation 17"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "TURN",
        "CLOSE",
        "STEP LEFT",
        "OPEN"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_hard_18",
    "tier": "hard",
    "name": "Rhythm Pattern 18",
    "eventCount": 7,
    "bambooTotalClaps": 3,
    "initialGridPosition": 5,
    "finalGridPosition": 3,
    "gridPath": [
      5,
      2,
      3,
      6
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "step_forward",
        "dancerPosition": 2,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "step_right",
        "dancerPosition": 3,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "step_center",
        "dancerPosition": 6,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 3,
        "bambooAction": "close",
        "dancerAction": "turn",
        "dancerPosition": 6,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 4,
        "bambooAction": "open",
        "dancerAction": "step_left",
        "dancerPosition": 5,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 5,
        "bambooAction": "close",
        "dancerAction": "step_forward",
        "dancerPosition": 2,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 6,
        "bambooAction": "open",
        "dancerAction": "step_right",
        "dancerPosition": 3,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "bamboo_position",
      "correctAnswer": "Bamboo position",
      "options": [
        "Bamboo position",
        "Dancer position",
        "Performer stance",
        "Nothing changed"
      ],
      "description": "Observation variation 18"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "STEP FORWARD",
        "CLOSE",
        "STEP RIGHT",
        "OPEN"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_hard_19",
    "tier": "hard",
    "name": "Rhythm Pattern 19",
    "eventCount": 7,
    "bambooTotalClaps": 3,
    "initialGridPosition": 5,
    "finalGridPosition": 1,
    "gridPath": [
      5,
      8,
      4,
      1
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "step_backward",
        "dancerPosition": 8,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "step_center",
        "dancerPosition": 5,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "step_left",
        "dancerPosition": 4,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 3,
        "bambooAction": "close",
        "dancerAction": "step_forward",
        "dancerPosition": 1,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 4,
        "bambooAction": "open",
        "dancerAction": "turn",
        "dancerPosition": 1,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 5,
        "bambooAction": "close",
        "dancerAction": "turn",
        "dancerPosition": 1,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 6,
        "bambooAction": "open",
        "dancerAction": "turn",
        "dancerPosition": 1,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "performer_stance",
      "correctAnswer": "Performer stance",
      "options": [
        "Performer stance",
        "Dancer position",
        "Bamboo position",
        "Nothing changed"
      ],
      "description": "Observation variation 19"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "STEP BACKWARD",
        "CLOSE",
        "CENTER STEP",
        "OPEN"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  },
  {
    "id": "seq_hard_20",
    "tier": "hard",
    "name": "Rhythm Pattern 20",
    "eventCount": 7,
    "bambooTotalClaps": 3,
    "initialGridPosition": 5,
    "finalGridPosition": 5,
    "gridPath": [
      5,
      4,
      7
    ],
    "events": [
      {
        "stepIndex": 0,
        "bambooAction": "open",
        "dancerAction": "step_left",
        "dancerPosition": 4,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 1,
        "bambooAction": "close",
        "dancerAction": "step_backward",
        "dancerPosition": 7,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 2,
        "bambooAction": "open",
        "dancerAction": "turn",
        "dancerPosition": 7,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 3,
        "bambooAction": "close",
        "dancerAction": "step_forward",
        "dancerPosition": 4,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 4,
        "bambooAction": "open",
        "dancerAction": "step_center",
        "dancerPosition": 5,
        "performerAction": "pull_apart"
      },
      {
        "stepIndex": 5,
        "bambooAction": "close",
        "dancerAction": "step_left",
        "dancerPosition": 4,
        "performerAction": "clack_together"
      },
      {
        "stepIndex": 6,
        "bambooAction": "open",
        "dancerAction": "step_center",
        "dancerPosition": 5,
        "performerAction": "pull_apart"
      }
    ],
    "changeScenario": {
      "type": "none",
      "correctAnswer": "Nothing changed",
      "options": [
        "Nothing changed",
        "Dancer position",
        "Bamboo position",
        "Performer stance"
      ],
      "description": "Observation variation 20"
    },
    "reconstructionSequence": {
      "targetSlots": [
        "OPEN",
        "STEP LEFT",
        "CLOSE",
        "STEP BACKWARD",
        "OPEN"
      ],
      "availableOptions": [
        "OPEN",
        "CLOSE",
        "STEP LEFT",
        "STEP RIGHT",
        "TURN",
        "CENTER STEP"
      ]
    }
  }
];

export const ALL_SEQUENCES = { easy: EASY_SEQUENCES, medium: MEDIUM_SEQUENCES, hard: HARD_SEQUENCES };
