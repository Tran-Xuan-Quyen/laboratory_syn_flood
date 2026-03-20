package handler

import (
	"encoding/json"
	"net/http"
)

type Handler struct{}

func New() *Handler {
	return &Handler{}
}

type Response struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

func (h *Handler) Health(w http.ResponseWriter, r *http.Request) {
	h.JSON(w, http.StatusOK, Response{
		Success: true,
		Data:    map[string]string{"status": "healthy"},
	})
}

func (h *Handler) JSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}
