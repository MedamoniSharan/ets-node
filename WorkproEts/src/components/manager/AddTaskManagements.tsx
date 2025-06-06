import {
  Box,
  Button,
  FormControl,
  MenuItem,
  Modal,
  Radio,
  RadioGroup,
  FormControlLabel,
  Select,
  TextField,
  Typography,
  Checkbox,
  InputAdornment,
  Chip,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import axios from "axios";
import { Clock, Eye, Plus, SearchIcon } from "lucide-react";
import {
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  ReactPortal,
  useEffect,
  useState,
} from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { TaskViewModal } from "./Dialog_ui/TaskViewModal";
import { fetchManagedDepartments } from "./fetchManagedDepartments";

const AddTaskManagements: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [taskManagerData, setManagerTaskData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [taskId, setTaskId] = useState<string>("");
  const [droneRequired, setDroneRequired] = useState<string>("No");
  const [dgpsRequired, setDgpsRequired] = useState<string>("No");
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<any[]>([]); // State for filtered tasks
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>(""); // Track selected department

  const handleViewTask = (task: any) => {
    setSelectedTask(task);
    setIsViewModalOpen(true);
  };

  const initialFormData = {
    projectName: "",
    projectId: "",
    taskName: "",
    employeeName: "",
    priority: "",
    deadline: "",
    description: "",
    managerName: sessionStorage.getItem("userName") || "",
    status: "Pending",
    estimatedHours: 0,
  };

  const [formData, setFormData] = useState(initialFormData);

  const columns: GridColDef[] = [
    {
      field: "projectName",
      headerName: "Project Name",
      flex: 1,
      renderCell: (params) => (
        <div
          onClick={() => {
            handleViewTask(params.row);
            setIsViewModalOpen(true);
            setTaskId(params.row.id);
          }}
          style={{
            cursor: "pointer",
            color: "#1e90ff",
          }}
        >
          {params.value}
        </div>
      ),
    },
    { field: "taskName", headerName: "Task Name", flex: 1 },
    {
      field: "employeeName",
      headerName: "Employee Name",
      flex: 1,
      renderCell: (params) => {
        const selectedEmployees = params.row.employees; // Assuming the task row contains `selectedEmployees`

        if (!selectedEmployees || selectedEmployees.length === 0) {
          return "No employees selected";
        }

        return (
          <div
            style={{
              display: "flex",
              justifyContent: "center", // Center horizontally
              alignItems: "flex-start", // Start vertically at the top
              flexWrap: "wrap",
              gap: "8px", // Space between chips
              height: "100%", // Match the height of the cell
              alignContent: "center", // Center content inside the wrapping area
              width: "100%", // Ensure the container takes the full cell width
            }}
          >
            {selectedEmployees.map(
              (
                name:
                  | string
                  | number
                  | boolean
                  | ReactElement<any, string | JSXElementConstructor<any>>
                  | Iterable<ReactNode>
                  | ReactPortal
                  | null
                  | undefined,
                index: Key | null | undefined
              ) => (
                <Chip
                  key={index}
                  label={name}
                  variant="outlined"
                  color="primary"
                  size="small"
                />
              )
            )}
          </div>
        );
      },
    },

    {
      field: "priority",
      headerName: "Priority",
      flex: 1,
      renderCell: (params) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            params.value === "High"
              ? "bg-red-100 text-red-800"
              : params.value === "Medium"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "deadline",
      headerName: "Deadline",
      flex: 1,
      renderCell: (params) => (
        <div className="flex items-center text-sm text-gray-500 mt-4">
          <Clock className="h-4 w-4 mr-1" />
          {new Date(params.value).toLocaleDateString()}
        </div>
      ),
    },
    {
      field: "estimatedHours",
      headerName: "Estimated Hours",
      flex: 1,
      renderCell: (params) => (
        <div className="text-sm text-gray-500  mt-4">{params.value} hrs</div>
      ),
    },
    { field: "description", headerName: "Description", flex: 2 },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            params.value === "Completed"
              ? "bg-green-100 text-green-800"
              : params.value === "In Progress"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-blue-100 text-violet-800"
          }`}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "action",
      headerName: "Action",
      width: 120,
      renderCell: (params) => (
        <Button
          variant="contained"
          startIcon={<Eye />}
          onClick={() => {
            handleViewTask(params.row);
            setIsViewModalOpen(true);
            setTaskId(params.row.id);
          }}
        >
          View
        </Button>
      ),
    },
  ];

  const fetchManagerTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "https://ets-node-1.onrender.com/api/get-task-by-manager-name",
        {
          managerName: sessionStorage.getItem("userName"),
        }
      );
      setManagerTaskData(response.data);
      setFilteredTasks(response.data);
    } catch (error) {
      console.error("Error fetching manager tasks:", error);
      toast.error("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.post(
          "https://ets-node-1.onrender.com/api/getAllProjectNamesForEmployee",
          {
            userId: sessionStorage.getItem("userId"),
          }
        );

        const projectData = response.data.map((project: any) => ({
          id: project._id,
          name: project.title,
        }));

        setProjects(projectData);
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast.error("Failed to fetch projects");
      }
    };

    const fetchEmployees = async () => {
      try {
        const response = await axios.post(
          "https://ets-node-1.onrender.com/api/employees-by-manager",
          {
            managerName: sessionStorage.getItem("userName"),
          }
        );

        const uniqueEmployees = Array.from(
          new Set(response.data.map((employee: any) => employee.name))
        ).map((uniqueName) => {
          const employee = response.data.find(
            (emp: any) => emp.name === uniqueName
          );

          const count = parseInt(employee.status.split(" ")[0]);

          let color;
          if (count === 0) {
            color = "green";
          } else if (count <= 2) {
            color = "orange";
          } else {
            color = "red";
          }

          return {
            id: employee._id,
            name: employee.name,
            department: employee.department,
            count: count,
            color: color,
          };
        });

        setEmployees(uniqueEmployees);
      } catch (error) {
        console.error("Error fetching employees:", error);
        toast.error("Failed to fetch employees");
      }
    };
    const loadDepartments = async () => {
      try {
        const userId = sessionStorage.getItem("userId");
        if (!userId) {
          throw new Error("User ID not found in session storage");
        }
        const departments = await fetchManagedDepartments(userId);
        setDepartments(departments);
      } catch (error) {
        console.error("Error fetching departments:", error);
        toast.error("Failed to fetch departments");
      }
    };

    loadDepartments();

    fetchManagerTasks();
    fetchProjects();
    fetchEmployees();
  }, []);

  const resetForm = () => {
    setFormData(initialFormData);
    setDroneRequired("No");
    setDgpsRequired("No");
    setSelectedEmployees([]);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleProjectChange = (e: any) => {
    const selectedProject = projects.find(
      (project) => project.id === e.target.value
    );
    if (selectedProject) {
      setFormData((prevData) => ({
        ...prevData,
        projectName: selectedProject.name,
        projectId: selectedProject.id,
      }));
    }
  };

  const handleDroneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDroneRequired(event.target.value);
  };

  const handleDgpsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDgpsRequired(event.target.value);
  };

  const handleEmployeeSelect = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setSelectedEmployees(event.target.value as string[]);
  };
  //modified by nithin handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure selectedEmployees is an array
    const validSelectedEmployees = Array.isArray(selectedEmployees)
      ? selectedEmployees
      : [];

    // Combine the assigned employee with the crew members into a unified array
    const allAssignedEmployees = new Set([
      formData.employeeName,
      ...validSelectedEmployees,
    ]);

    // Prepare the updated form data
    const updatedFormData = {
      ...formData,
      employeeDepartment: selectedDepartment,
      managerName: sessionStorage.getItem("userName"), // Ensure sessionStorage key is correctly set
      droneRequired,
      dgpsRequired,
      selectedEmployees: Array.isArray(validSelectedEmployees) ? validSelectedEmployees : [], // Validate `selectedEmployees` is an array
      employees: Array.from(allAssignedEmployees || []), // Ensure `allAssignedEmployees` is iterable
      estimatedHours: parseInt(formData.estimatedHours, 10) || 0, // Ensure `estimatedHours` is a number
    };
    
    try {
      console.log("Submitting form data:", updatedFormData); // Debug log for payload
    
      const response = await axios.post(
        "https://ets-node-1.onrender.com/api/store-form-data",
        updatedFormData
      );
    
      // Handle successful response
      if (response.status === 201) {
        toast.success("Task successfully added!");
        resetForm();
        setIsModalOpen(false);
        fetchManagerTasks(); // Refresh task list
        setSelectedDepartment("");
      } else {
        // Log unexpected responses for debugging
        console.warn("Unexpected response from server:", response);
        toast.error("Failed to add task due to unexpected server response");
      }
    } catch (error) {
      // Log error details for debugging
      console.error("Error submitting form data:", error);
    
      // Extract meaningful error message from server response
      const errorMessage = error.response?.data?.message || "Failed to add task";
    
      // Display error to the user
      toast.error(errorMessage);
    }
    
    
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);

    // Filter tasks based on search term
    const filtered = taskManagerData.filter((task) => {
      const searchFields =
        `${task.projectName} ${task.taskName} ${task.employeeName} ${task.priority} ${task.description} ${task.status}`.toLowerCase();
      return searchFields.includes(value);
    });

    setFilteredTasks(filtered);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <ToastContainer />
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">Task Management</h2>
        <Button
          variant="contained"
          startIcon={<Plus />}
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
        >
          Add Task
        </Button>
      </div>
      <Box sx={{ mb: 2 }}>
        <TextField
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search projects,task , ..."
          variant="outlined"
          style={{ width: "400px" }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <div style={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={taskManagerData.map((task) => ({
            id: task._id,
            ...task,
          }))}
          columns={columns}
          loading={loading}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 5, page: 0 },
            },
          }}
          pageSizeOptions={[5, 10, 20]}
          disableRowSelectionOnClick
        />
      </div>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            maxHeight: "90vh",
            overflowY: "auto",
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <h3 className="text-lg font-medium mb-4">Add Task</h3>
          <form onSubmit={handleSubmit}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <Typography>Department</Typography>
              <Select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                displayEmpty
                required
              >
                <MenuItem value="" disabled>
                  Select a department
                </MenuItem>
                {departments.map((department) => (
                  <MenuItem key={department} value={department}>
                    {department}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography>Project Name</Typography>
            <FormControl fullWidth sx={{ mb: 1 }}>
              <Select
                value={formData.projectId}
                onChange={handleProjectChange}
                required
              >
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Task Name"
              name="taskName"
              value={formData.taskName}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <FormControl fullWidth sx={{ mb: 1 }}>
              <Typography>Employee Name</Typography>
              <Select
                name="employeeName"
                value={formData.employeeName}
                onChange={(e) => {
                  const selectedEmployee = employees.find(
                    (employee) => employee.name === e.target.value
                  );

                  if (selectedEmployee) {
                    setFormData((prevData) => ({
                      ...prevData,
                      employeeName: selectedEmployee.name,
                      employeeDepartment: selectedEmployee.department,
                    }));
                  }
                }}
                required
                displayEmpty
              >
                {employees.map((employee) => (
                  <MenuItem
                    key={employee.id}
                    value={employee.name}
                    style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid #eee",
                      minWidth: "200px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                        gap: "16px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "15px",
                          fontWeight: 500,
                        }}
                      >
                        {employee.name}
                      </span>
                      <span
                        style={{
                          color:
                            employee.count === 0
                              ? "#2e7d32"
                              : employee.count <= 5
                              ? "#ed6c02"
                              : "#d32f2f",
                          fontSize: "14px",
                          fontWeight: "bold",
                          backgroundColor:
                            employee.count === 0
                              ? "#e8f5e9"
                              : employee.count <= 5
                              ? "#fff3e0"
                              : "#ffebee",
                          padding: "4px 10px",
                          borderRadius: "12px",
                          minWidth: "30px",
                          textAlign: "center",
                        }}
                      >
                        {employee.count}
                      </span>
                    </div>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography>Drone Required</Typography>
            <RadioGroup row value={droneRequired} onChange={handleDroneChange}>
              <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="No" control={<Radio />} label="No" />
            </RadioGroup>
            {droneRequired === "Yes" && (
              <FormControl fullWidth sx={{ mb: 1 }}>
                <Typography>Crew</Typography>
                <Select
                  multiple
                  value={selectedEmployees}
                  onChange={handleEmployeeSelect}
                  renderValue={(selected) => (selected as string[]).join(", ")}
                >
                  {employees
                    .filter(
                      (employee) => employee.name !== formData.employeeName
                    ) // Exclude primary employee
                    .map((employee) => (
                      <MenuItem key={employee.id} value={employee.name}>
                        <Checkbox
                          checked={
                            selectedEmployees.indexOf(employee.name) > -1
                          }
                        />
                        {employee.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            )}

            <Typography>DGPS Required</Typography>
            <RadioGroup row value={dgpsRequired} onChange={handleDgpsChange}>
              <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="No" control={<Radio />} label="No" />
            </RadioGroup>
            <Typography>Priority</Typography>
            <FormControl fullWidth sx={{ mb: 1 }}>
              <Select
                name="priority"
                value={formData.priority}
                onChange={(e) =>
                  setFormData((prevData) => ({
                    ...prevData,
                    priority: e.target.value,
                  }))
                }
                required
              >
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Deadline"
              name="deadline"
              type="date"
              value={formData.deadline}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Estimated Hours"
              name="estimatedHours"
              type="number"
              value={formData.estimatedHours}
              onChange={handleInputChange}
              margin="normal"
              required
            />

            <Typography>Status</Typography>
            <FormControl fullWidth sx={{ mb: 1 }}>
              <Select
                name="status"
                value={formData.status}
                onChange={(e) =>
                  setFormData((prevData) => ({
                    ...prevData,
                    status: e.target.value,
                  }))
                }
                required
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              margin="normal"
              multiline
              rows={3}
            />
            <Box mt={2} display="flex" justifyContent="flex-end">
              <Button variant="contained" type="submit" color="primary">
                Add Task
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>

      <TaskViewModal
        task={selectedTask}
        open={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        taskId={taskId}
      />
    </div>
  );
};

export default AddTaskManagements;
