import { supabase } from './supabase'

// ============================================
// AUTH API
// ============================================

export const authAPI = {
    // Register new customer
    register: async (userData) => {
        try {
            const { name, email, phone, password } = userData

            // Check if user exists
            const { data: existingUser } = await supabase
                .from('customers')
                .select('email, phone')
                .or(`email.eq.${email},phone.eq.${phone}`)
                .single()

            if (existingUser) {
                return {
                    success: false,
                    message: existingUser.email === email
                        ? 'User with this email already exists'
                        : 'User with this phone number already exists'
                }
            }

            // Insert new customer
            const { data, error } = await supabase
                .from('customers')
                .insert([{ name, email, phone, password, email_verified: false }])
                .select()
                .single()

            if (error) throw error

            // Generate token (store user data in localStorage)
            const token = btoa(JSON.stringify({
                id: data.customer_id,
                email: data.email,
                role: 'customer'
            }))

            return {
                success: true,
                message: 'Registration successful',
                token,
                user: {
                    id: data.customer_id,
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    role: 'customer'
                }
            }
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Registration failed'
            }
        }
    },

    // Login
    login: async (credentials) => {
        try {
            const { email, password } = credentials

            // Try customers table
            let { data: user, error } = await supabase
                .from('customers')
                .select('customer_id, name, email, phone, password')
                .eq('email', email)
                .eq('password', password)
                .single()

            let role = 'customer'
            let userId = user?.customer_id

            // If not found, try managers table
            if (error || !user) {
                const { data: manager, error: managerError } = await supabase
                    .from('managers')
                    .select('manager_id, name, email, phone, password')
                    .eq('email', email)
                    .eq('password', password)
                    .single()

                if (!managerError && manager) {
                    user = manager
                    role = 'manager'
                    userId = manager.manager_id
                }
            }

            // If not found, try mechanics table
            if (!user) {
                const { data: mechanic, error: mechanicError } = await supabase
                    .from('mechanics')
                    .select('mechanic_id, name, email, phone, password, experience_years, specialization, specializations, available, availability_status, rating, hourly_rate')
                    .eq('email', email)
                    .eq('password', password)
                    .single()

                if (!mechanicError && mechanic) {
                    user = mechanic
                    role = 'mechanic'
                    userId = mechanic.mechanic_id
                }
            }

            if (!user) {
                return {
                    success: false,
                    message: 'Invalid email or password'
                }
            }

            // Generate token
            const token = btoa(JSON.stringify({
                id: userId,
                email: user.email,
                role
            }))

            // Build user object based on role
            const userResponse = {
                id: userId,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role
            }

            // Add role-specific fields
            if (role === 'mechanic') {
                userResponse.mechanic_id = user.mechanic_id
                userResponse.experience_years = user.experience_years
                userResponse.rating = user.rating
                // Support both old and new column names
                userResponse.hourly_rate = user.hourly_rate || 0
                userResponse.specializations = user.specializations || (user.specialization ? [user.specialization] : [])
                userResponse.availability_status = user.availability_status || (user.available ? 'available' : 'offline')
                userResponse.available = user.available
            } else if (role === 'manager') {
                userResponse.manager_id = user.manager_id
            } else if (role === 'customer') {
                userResponse.customer_id = user.customer_id
            }

            return {
                success: true,
                message: 'Login successful',
                token,
                user: userResponse
            }
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Login failed'
            }
        }
    }
}

// ============================================
// VEHICLES API
// ============================================

export const vehiclesAPI = {
    // Get customer vehicles
    getCustomerVehicles: async (customerId) => {
        try {
            const { data, error } = await supabase
                .from('vehicles')
                .select(`
                    *,
                    customers(name, email, phone)
                `)
                .eq('customer_id', customerId)
                .order('created_at', { ascending: false })

            if (error) throw error

            return {
                success: true,
                data: data || []
            }
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    },

    // Get all vehicles (for managers)
    getAllVehicles: async () => {
        try {
            const { data, error } = await supabase
                .from('vehicles')
                .select(`
                    *,
                    customers(name, email, phone)
                `)
                .order('created_at', { ascending: false })

            if (error) throw error

            return {
                success: true,
                data: data || []
            }
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    },

    // Add new vehicle
    addVehicle: async (vehicleData) => {
        try {
            const { data, error } = await supabase
                .from('vehicles')
                .insert([vehicleData])
                .select()
                .single()

            if (error) throw error

            return {
                success: true,
                message: 'Vehicle added successfully',
                data
            }
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    },

    // Delete vehicle
    deleteVehicle: async (vehicleId) => {
        try {
            const { error } = await supabase
                .from('vehicles')
                .delete()
                .eq('vehicle_id', vehicleId)

            if (error) throw error

            return {
                success: true,
                message: 'Vehicle deleted successfully'
            }
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }
}

// ============================================
// SERVICES API
// ============================================

export const servicesAPI = {
    // Get all services
    getAllServices: async () => {
        try {
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .eq('active', true)
                .order('category', { ascending: true })

            if (error) throw error

            return {
                success: true,
                data: data || []
            }
        } catch (error) {
            return {
                success: false,
                message: error.message,
                data: []
            }
        }
    }
}

// ============================================
// SERVICE REQUESTS API
// ============================================

export const serviceRequestsAPI = {
    // Create service request
    createServiceRequest: async (requestData) => {
        try {
            // Extract service_id from requestData as it goes in junction table
            const { service_id, ...mainRequestData } = requestData;

            // Insert into service_requests table (without service_id)
            const { data: requestRecord, error: requestError } = await supabase
                .from('service_requests')
                .insert([mainRequestData])
                .select()
                .single()

            if (requestError) throw requestError

            // Insert into service_request_services junction table
            const { error: junctionError } = await supabase
                .from('service_request_services')
                .insert([{
                    request_id: requestRecord.request_id,
                    service_id: service_id
                }])

            if (junctionError) {
                // Rollback: delete the service request if junction insert fails
                await supabase
                    .from('service_requests')
                    .delete()
                    .eq('request_id', requestRecord.request_id)

                throw junctionError
            }

            return {
                success: true,
                message: 'Service request created successfully',
                data: requestRecord
            }
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    },

    // Get customer service requests
    getCustomerRequests: async (customerId) => {
        try {
            const { data, error } = await supabase
                .from('service_requests')
                .select(`
          *,
          vehicles(brand, model, registration_number),
          mechanics(name, phone),
          service_request_services(
            service_id,
            services(name, base_price, estimated_duration)
          )
        `)
                .eq('customer_id', customerId)
                .order('created_at', { ascending: false })

            if (error) throw error

            return {
                success: true,
                data: data || []
            }
        } catch (error) {
            return {
                success: false,
                message: error.message,
                data: []
            }
        }
    },

    // Get mechanic jobs
    getMechanicJobs: async (mechanicId) => {
        try {
            const { data, error } = await supabase
                .from('service_requests')
                .select(`
          *,
          vehicles(brand, model, registration_number),
          customers(name, phone),
          service_request_services(
            service_id,
            services(name, base_price, estimated_duration)
          )
        `)
                .eq('assigned_mechanic', mechanicId)
                .order('scheduled_date', { ascending: true })

            if (error) throw error

            return {
                success: true,
                data: data || []
            }
        } catch (error) {
            return {
                success: false,
                message: error.message,
                data: []
            }
        }
    },

    // Get all service requests (for managers)
    getAllRequests: async () => {
        try {
            const { data, error } = await supabase
                .from('service_requests')
                .select(`
          *,
          vehicles(brand, model, registration_number, year),
          customers(name, phone, email),
          mechanics(name, phone),
          service_request_services(
            service_id,
            services(name, description, base_price, estimated_duration)
          )
        `)
                .order('created_at', { ascending: false })

            if (error) throw error

            return {
                success: true,
                data: data || []
            }
        } catch (error) {
            return {
                success: false,
                message: error.message,
                data: []
            }
        }
    },

    // Update service request status
    updateStatus: async (requestId, status, notes = '', finalCost = null) => {
        try {
            const updateData = { status }
            if (notes) updateData.mechanic_notes = notes
            if (status === 'completed') {
                updateData.completion_date = new Date().toISOString()
                if (finalCost) updateData.final_cost = parseFloat(finalCost)
            }

            const { data, error } = await supabase
                .from('service_requests')
                .update(updateData)
                .eq('request_id', requestId)
                .select()
                .single()

            if (error) throw error

            return {
                success: true,
                message: 'Status updated successfully',
                data
            }
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    },

    // Assign mechanic
    assignMechanic: async (requestId, mechanicId) => {
        try {
            const { data, error } = await supabase
                .from('service_requests')
                .update({
                    assigned_mechanic: mechanicId,
                    status: 'approved'
                })
                .eq('request_id', requestId)
                .select()
                .single()

            if (error) throw error

            return {
                success: true,
                message: 'Mechanic assigned successfully',
                data
            }
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    },

    // Clear all service requests (Manager only)
    clearAll: async () => {
        try {
            // First delete from junction tables (service_request_services)
            const { error: junctionError } = await supabase
                .from('service_request_services')
                .delete()
                .neq('request_id', 0) // Delete all rows

            if (junctionError) throw junctionError

            // Delete from service_parts if it has data
            const { error: partsError } = await supabase
                .from('service_request_parts')
                .delete()
                .neq('request_id', 0) // Delete all rows

            // Ignore error if table is empty or doesn't exist

            // Finally delete all service requests
            const { error: requestsError } = await supabase
                .from('service_requests')
                .delete()
                .neq('request_id', 0) // Delete all rows

            if (requestsError) throw requestsError

            return {
                success: true,
                message: 'All service requests and related data cleared successfully'
            }
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    },

    // Add service parts to a service request
    addServiceParts: async (requestId, parts) => {
        try {
            const partsData = parts.map(part => ({
                request_id: requestId,
                part_id: part.id,
                quantity_used: part.quantity,
                part_cost: part.price * part.quantity
            }));

            const { data, error } = await supabase
                .from('service_request_parts')
                .insert(partsData)
                .select();

            if (error) throw error;

            return {
                success: true,
                message: 'Service parts added successfully',
                data
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    },

    // Mark jobs as paid
    markJobsAsPaid: async (requestIds) => {
        try {
            const { error } = await supabase
                .from('service_requests')
                .update({ is_paid: true })
                .in('request_id', requestIds);

            if (error) throw error;

            return {
                success: true,
                message: 'Jobs marked as paid successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }
}

// ============================================
// CUSTOMERS API
// ============================================

export const customersAPI = {
    // Get all customers
    getAllCustomers: async () => {
        try {
            const { data, error } = await supabase
                .from('customers')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error

            return {
                success: true,
                data: data || []
            }
        } catch (error) {
            return {
                success: false,
                message: error.message,
                data: []
            }
        }
    }
}

// ============================================
// MECHANICS API
// ============================================

export const mechanicsAPI = {
    // Get all mechanics
    getAllMechanics: async () => {
        try {
            const { data, error } = await supabase
                .from('mechanics')
                .select('*')
                .order('name', { ascending: true })

            if (error) throw error

            return {
                success: true,
                data: data || []
            }
        } catch (error) {
            return {
                success: false,
                message: error.message,
                data: []
            }
        }
    },

    // Update mechanic
    updateMechanic: async (mechanicId, updates) => {
        try {
            const { data, error } = await supabase
                .from('mechanics')
                .update(updates)
                .eq('mechanic_id', mechanicId)
                .select()
                .single()

            if (error) throw error

            return { data, error: null }
        } catch (error) {
            return { data: null, error: error.message }
        }
    },

    // Delete mechanic and all references
    deleteMechanic: async (mechanicId) => {
        try {
            // Delete from service_requests (updates to remove mechanic reference)
            const { error: requestsError } = await supabase
                .from('service_requests')
                .update({ mechanic_id: null })
                .eq('mechanic_id', mechanicId)

            if (requestsError) throw requestsError

            // Delete mechanic
            const { error: deleteError } = await supabase
                .from('mechanics')
                .delete()
                .eq('mechanic_id', mechanicId)

            if (deleteError) throw deleteError

            return {
                success: true,
                message: 'Mechanic dismissed successfully'
            }
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to dismiss mechanic'
            }
        }
    }
}

// ============================================
// PARTS API
// ============================================

export const partsAPI = {
    // Get all parts
    getAllParts: async (filters = {}) => {
        try {
            let query = supabase
                .from('parts')
                .select('*')

            if (filters.category) {
                query = query.eq('category', filters.category)
            }

            if (filters.search) {
                query = query.or(`part_name.ilike.%${filters.search}%,part_code.ilike.%${filters.search}%`)
            }

            if (filters.low_stock) {
                query = query.lte('current_stock', supabase.raw('stock_min'))
            }

            const { data, error } = await query.order('category', { ascending: true })

            if (error) throw error

            return {
                success: true,
                data: data || []
            }
        } catch (error) {
            return {
                success: false,
                message: error.message,
                data: []
            }
        }
    },

    // Get categories
    getCategories: async () => {
        try {
            const { data, error } = await supabase
                .from('parts')
                .select('category')
                .order('category', { ascending: true })

            if (error) throw error

            const categories = [...new Set(data.map(item => item.category))]

            return {
                success: true,
                data: categories
            }
        } catch (error) {
            return {
                success: false,
                message: error.message,
                data: []
            }
        }
    },

    // Update stock
    updateStock: async (partId, stockValue, action = 'set') => {
        try {
            // First get the current stock
            const { data: currentPart, error: fetchError } = await supabase
                .from('parts')
                .select('current_stock')
                .eq('id', partId)
                .single()

            if (fetchError) throw fetchError

            let newStock = parseInt(stockValue)

            // Calculate new stock based on action
            if (action === 'add') {
                newStock = currentPart.current_stock + parseInt(stockValue)
            } else if (action === 'subtract') {
                newStock = Math.max(0, currentPart.current_stock - parseInt(stockValue))
            }

            // Update the stock
            const { data, error } = await supabase
                .from('parts')
                .update({
                    current_stock: newStock,
                    updated_at: new Date().toISOString()
                })
                .eq('id', partId)
                .select()
                .single()

            if (error) throw error

            return {
                success: true,
                message: 'Stock updated successfully',
                data
            }
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }
}

// ============================================
// CAR TYPES API
// ============================================

export const carTypesAPI = {
    // Get all car types with optional filters
    getAll: async (filters = {}) => {
        try {
            let query = supabase.from('cartypes').select('*')

            // Apply filters
            if (filters.brand && filters.brand !== 'all') {
                query = query.eq('brand', filters.brand)
            }

            if (filters.body_type && filters.body_type !== 'all') {
                query = query.eq('body_type', filters.body_type)
            }

            if (filters.search) {
                query = query.or(`brand.ilike.%${filters.search}%,model.ilike.%${filters.search}%`)
            }

            const { data, error } = await query.order('brand', { ascending: true }).order('model', { ascending: true })

            if (error) throw error

            return {
                success: true,
                data: data || []
            }
        } catch (error) {
            return {
                success: false,
                message: error.message,
                data: []
            }
        }
    },

    // Get all unique brands
    getBrands: async () => {
        try {
            const { data, error } = await supabase
                .from('cartypes')
                .select('brand')
                .order('brand', { ascending: true })

            if (error) throw error

            const brands = [...new Set(data.map(item => item.brand))]

            return {
                success: true,
                data: brands
            }
        } catch (error) {
            return {
                success: false,
                message: error.message,
                data: []
            }
        }
    },

    // Get all unique body types
    getBodyTypes: async () => {
        try {
            const { data, error } = await supabase
                .from('cartypes')
                .select('body_type')
                .order('body_type', { ascending: true })

            if (error) throw error

            const bodyTypes = [...new Set(data.map(item => item.body_type).filter(Boolean))]

            return {
                success: true,
                data: bodyTypes
            }
        } catch (error) {
            return {
                success: false,
                message: error.message,
                data: []
            }
        }
    }
}

// Salary Payments API
export const salaryPaymentsAPI = {
    // Create a new salary payment record
    createPayment: async (paymentData) => {
        try {
            const { data, error } = await supabase
                .from('salary_payments')
                .insert([{
                    mechanic_id: paymentData.mechanic_id,
                    time_based_pay: paymentData.time_based_pay,
                    bonus_amount: paymentData.bonus_amount,
                    total_amount: paymentData.total_amount,
                    jobs_included: paymentData.jobs_included,
                    paid_by: paymentData.paid_by,
                    notes: paymentData.notes || null
                }])
                .select()
                .single();

            if (error) throw error;

            return {
                success: true,
                data: data,
                message: 'Payment record created successfully'
            };
        } catch (error) {
            console.error('Error creating payment:', error);
            return {
                success: false,
                message: error.message
            };
        }
    },

    // Get payment history for a specific mechanic
    getMechanicPayments: async (mechanicId) => {
        try {
            const { data, error } = await supabase
                .from('salary_payments')
                .select(`
                    *,
                    mechanics (
                        name,
                        email
                    )
                `)
                .eq('mechanic_id', mechanicId)
                .order('payment_date', { ascending: false });

            if (error) throw error;

            return {
                success: true,
                data: data || [],
                message: 'Payment history retrieved successfully'
            };
        } catch (error) {
            console.error('Error fetching mechanic payments:', error);
            return {
                success: false,
                message: error.message,
                data: []
            };
        }
    },

    // Get all salary payments (for manager view)
    getAllPayments: async () => {
        try {
            const { data, error } = await supabase
                .from('salary_payments')
                .select(`
                    *,
                    mechanics (
                        mechanic_id,
                        name,
                        email,
                        phone,
                        specializations
                    )
                `)
                .order('payment_date', { ascending: false });

            if (error) throw error;

            return {
                success: true,
                data: data || [],
                message: 'All payments retrieved successfully'
            };
        } catch (error) {
            console.error('Error fetching all payments:', error);
            return {
                success: false,
                message: error.message,
                data: []
            };
        }
    },

    // Get payment statistics
    getPaymentStats: async () => {
        try {
            const { data, error } = await supabase
                .from('salary_payments')
                .select('total_amount, payment_date, mechanic_id');

            if (error) throw error;

            // Calculate statistics
            const totalPaid = data.reduce((sum, payment) => sum + parseFloat(payment.total_amount), 0);
            const avgPayment = data.length > 0 ? totalPaid / data.length : 0;
            const uniqueMechanics = [...new Set(data.map(p => p.mechanic_id))].length;

            // Get current month payments
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            const monthlyPayments = data.filter(payment => {
                const paymentDate = new Date(payment.payment_date);
                return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
            });
            const monthlyTotal = monthlyPayments.reduce((sum, payment) => sum + parseFloat(payment.total_amount), 0);

            return {
                success: true,
                data: {
                    totalPaid,
                    avgPayment,
                    uniqueMechanics,
                    totalPayments: data.length,
                    monthlyTotal,
                    monthlyPayments: monthlyPayments.length
                }
            };
        } catch (error) {
            console.error('Error fetching payment stats:', error);
            return {
                success: false,
                message: error.message,
                data: null
            };
        }
    }
}

export default {
    auth: authAPI,
    vehicles: vehiclesAPI,
    services: servicesAPI,
    serviceRequests: serviceRequestsAPI,
    customers: customersAPI,
    mechanics: mechanicsAPI,
    parts: partsAPI,
    carTypes: carTypesAPI,
    salaryPayments: salaryPaymentsAPI
}
